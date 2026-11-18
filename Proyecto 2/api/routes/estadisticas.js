const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

// ============================================================
// CONSULTA 1: Estadísticas de evaluaciones por centro y escuela
// ============================================================
router.get('/evaluaciones-por-centro', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT
                c.NOMBRE AS CENTRO,
                e.NOMBRE AS ESCUELA,
                COUNT(ex.ID_EXAMEN) AS TOTAL_EXAMENES,
                ROUND(
                    AVG(
                        CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 
                        THEN teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS 
                        ELSE NULL END
                    ), 2
                ) AS PROMEDIO_TEORICO,
                ROUND(
                    AVG(
                        CASE WHEN practico.PUNTEO_MAX > 0 
                        THEN practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX 
                        ELSE NULL END
                    ), 2
                ) AS PROMEDIO_PRACTICO,
                SUM(
                    CASE WHEN 
                        (CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 
                              THEN teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS 
                              ELSE 0 END) >= 70
                        AND
                        (CASE WHEN practico.PUNTEO_MAX > 0 
                              THEN practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX 
                              ELSE 0 END) >= 70
                    THEN 1 ELSE 0 END
                ) AS APROBADOS
            FROM EXAMEN ex
            JOIN REGISTRO r ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO
            JOIN CENTRO c ON ex.REGISTRO_ID_CENTRO = c.ID_CENTRO
            JOIN ESCUELA e ON ex.REGISTRO_ID_ESCUELA = e.ID_ESCUELA
            LEFT JOIN (
                SELECT 
                    ru.EXAMEN_ID_EXAMEN,
                    COUNT(ru.ID_RESPUESTA_USUARIO) AS TOTAL_RESPONDIDAS,
                    SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END) AS CORRECTAS
                FROM RESPUESTA_USUARIO ru
                JOIN PREGUNTAS p ON ru.PREGUNTA_ID_PREGUNTA = p.ID_PREGUNTA
                GROUP BY ru.EXAMEN_ID_EXAMEN
            ) teorico ON ex.ID_EXAMEN = teorico.EXAMEN_ID_EXAMEN
            LEFT JOIN (
                SELECT 
                    rpu.EXAMEN_ID_EXAMEN,
                    SUM(rpu.NOTA) AS NOTA_OBTENIDA,
                    (SELECT SUM(pp.PUNTEO) FROM PREGUNTAS_PRACTICO pp
                     WHERE pp.ID_PREGUNTA_PRACTICO IN (
                         SELECT rpu2.PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO 
                         FROM RESPUESTA_PRACTICO_USUARIO rpu2 
                         WHERE rpu2.EXAMEN_ID_EXAMEN = rpu.EXAMEN_ID_EXAMEN
                     )
                    ) AS PUNTEO_MAX
                FROM RESPUESTA_PRACTICO_USUARIO rpu
                GROUP BY rpu.EXAMEN_ID_EXAMEN
            ) practico ON ex.ID_EXAMEN = practico.EXAMEN_ID_EXAMEN
            GROUP BY c.NOMBRE, e.NOMBRE
            ORDER BY c.NOMBRE, e.NOMBRE`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

// ============================================================
// CONSULTA 2: Ranking de evaluados por resultado final
// ============================================================
router.get('/ranking-evaluados', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT
                RANK() OVER (ORDER BY 
                    CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 AND practico.PUNTEO_MAX > 0
                         THEN (teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS + 
                               practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX) / 2
                         WHEN teorico.TOTAL_RESPONDIDAS > 0
                         THEN teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS
                         WHEN practico.PUNTEO_MAX > 0
                         THEN practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX
                         ELSE 0
                    END DESC NULLS LAST
                ) AS RANKING,
                r.NOMBRE_COMPLETO,
                r.TIPO_LICENCIA,
                TO_CHAR(r.FECHA, 'YYYY-MM-DD') AS FECHA,
                e.NOMBRE AS ESCUELA,
                c.NOMBRE AS CENTRO,
                NVL(teorico.CORRECTAS, 0) AS RESPUESTAS_CORRECTAS,
                NVL(teorico.TOTAL_RESPONDIDAS, 0) AS TOTAL_PREGUNTAS_TEORICAS,
                CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 
                     THEN ROUND(teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS, 2)
                     ELSE NULL END AS PUNTEO_TEORICO,
                NVL(practico.NOTA_OBTENIDA, 0) AS NOTA_PRACTICA_OBTENIDA,
                NVL(practico.PUNTEO_MAX, 0) AS PUNTEO_PRACTICO_MAXIMO,
                CASE WHEN practico.PUNTEO_MAX > 0 
                     THEN ROUND(practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX, 2)
                     ELSE NULL END AS PUNTEO_PRACTICO,
                CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 AND practico.PUNTEO_MAX > 0
                     THEN ROUND((teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS + 
                                 practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX) / 2, 2)
                     WHEN teorico.TOTAL_RESPONDIDAS > 0
                     THEN ROUND(teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS, 2)
                     WHEN practico.PUNTEO_MAX > 0
                     THEN ROUND(practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX, 2)
                     ELSE NULL END AS PUNTEO_FINAL,
                CASE WHEN 
                    (CASE WHEN teorico.TOTAL_RESPONDIDAS > 0 
                          THEN teorico.CORRECTAS * 100.0 / teorico.TOTAL_RESPONDIDAS 
                          ELSE 0 END) >= 70
                    AND
                    (CASE WHEN practico.PUNTEO_MAX > 0 
                          THEN practico.NOTA_OBTENIDA * 100.0 / practico.PUNTEO_MAX 
                          ELSE 0 END) >= 70
                THEN 'Aprobado'
                ELSE 'Reprobado'
                END AS RESULTADO
            FROM EXAMEN ex
            JOIN REGISTRO r ON ex.REGISTRO_ID_REGISTRO = r.ID_REGISTRO
            JOIN CENTRO c ON ex.REGISTRO_ID_CENTRO = c.ID_CENTRO
            JOIN ESCUELA e ON ex.REGISTRO_ID_ESCUELA = e.ID_ESCUELA
            LEFT JOIN (
                SELECT 
                    ru.EXAMEN_ID_EXAMEN,
                    COUNT(ru.ID_RESPUESTA_USUARIO) AS TOTAL_RESPONDIDAS,
                    SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END) AS CORRECTAS
                FROM RESPUESTA_USUARIO ru
                JOIN PREGUNTAS p ON ru.PREGUNTA_ID_PREGUNTA = p.ID_PREGUNTA
                GROUP BY ru.EXAMEN_ID_EXAMEN
            ) teorico ON ex.ID_EXAMEN = teorico.EXAMEN_ID_EXAMEN
            LEFT JOIN (
                SELECT 
                    rpu.EXAMEN_ID_EXAMEN,
                    SUM(rpu.NOTA) AS NOTA_OBTENIDA,
                    (SELECT SUM(pp.PUNTEO) FROM PREGUNTAS_PRACTICO pp
                     WHERE pp.ID_PREGUNTA_PRACTICO IN (
                         SELECT rpu2.PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO 
                         FROM RESPUESTA_PRACTICO_USUARIO rpu2 
                         WHERE rpu2.EXAMEN_ID_EXAMEN = rpu.EXAMEN_ID_EXAMEN
                     )
                    ) AS PUNTEO_MAX
                FROM RESPUESTA_PRACTICO_USUARIO rpu
                GROUP BY rpu.EXAMEN_ID_EXAMEN
            ) practico ON ex.ID_EXAMEN = practico.EXAMEN_ID_EXAMEN
            ORDER BY RANKING`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

// ============================================================
// CONSULTA 3: Pregunta con menor porcentaje de aciertos
// ============================================================
router.get('/pregunta-menor-aciertos', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT 
    p.ID_PREGUNTA AS ID,
    p.PREGUNTA_TEXTO,
    CASE p.RESPUESTA
        WHEN 1 THEN 'A'
        WHEN 2 THEN 'B'
        WHEN 3 THEN 'C'
        WHEN 4 THEN 'D'
    END AS RESPUESTA_CORRECTA,
    COUNT(ru.ID_RESPUESTA_USUARIO) AS TOTAL_RESPUESTAS,
    SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END) AS TOTAL_ACIERTOS,
    ROUND(
        SUM(CASE WHEN ru.RESPUESTA = p.RESPUESTA THEN 1 ELSE 0 END)
        * 100.0 / NULLIF(COUNT(ru.ID_RESPUESTA_USUARIO), 0), 2
    ) AS PORCENTAJE_ACIERTOS
FROM PREGUNTAS p
JOIN RESPUESTA_USUARIO ru 
    ON p.ID_PREGUNTA = ru.PREGUNTA_ID_PREGUNTA
GROUP BY p.ID_PREGUNTA, p.PREGUNTA_TEXTO, p.RESPUESTA
ORDER BY PORCENTAJE_ACIERTOS ASC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;