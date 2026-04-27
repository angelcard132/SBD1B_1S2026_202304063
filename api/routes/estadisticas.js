const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

// Consulta 1: Estadísticas de evaluaciones por centro y escuela
router.get('/evaluaciones-por-centro', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT 
                c.nombreCentro AS centro,
                e.nombreEscuela AS escuela,
                COUNT(r.idRegistro) AS totalExamenes,
                ROUND(AVG(r.resultadoTeorico), 2) AS promedioTeorico,
                ROUND(AVG(r.resultadoPractico), 2) AS promedioPractico,
                SUM(CASE WHEN r.resultadoTeorico >= 60 AND r.resultadoPractico >= 60 THEN 1 ELSE 0 END) AS aprobados
             FROM regis_evalua r
             JOIN CENTRO c ON r.CENTRO_idCentro = c.idCentro
             JOIN PERSONA p ON r.PERSONA_idPersona = p.idPersona
             JOIN Escuela e ON p.Escuela_idEscuela = e.idEscuela
             GROUP BY c.nombreCentro, e.nombreEscuela
             ORDER BY c.nombreCentro, e.nombreEscuela`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

// Consulta 2: Ranking de evaluados por resultado final
router.get('/ranking-evaluados', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT 
                RANK() OVER (ORDER BY (r.resultadoTeorico + r.resultadoPractico) DESC) AS ranking,
                p.nombrePersona AS evaluado,
                p.identificacion,
                r.resultadoTeorico,
                r.resultadoPractico,
                ROUND((r.resultadoTeorico + r.resultadoPractico) / 2, 2) AS promedioFinal,
                CASE WHEN r.resultadoTeorico >= 60 AND r.resultadoPractico >= 60 THEN 'APROBADO' ELSE 'REPROBADO' END AS estado
             FROM regis_evalua r
             JOIN PERSONA p ON r.PERSONA_idPersona = p.idPersona
             ORDER BY ranking`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

// Consulta 3: Pregunta con menor porcentaje de aciertos
router.get('/pregunta-menor-aciertos', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT 
                pf.idPregunta,
                pf.numeroPregunta,
                pf.descPregunta,
                COUNT(rr.idRegistroRespuesta) AS totalRespuestas,
                SUM(CASE WHEN rp.esCorrecta = 'S' THEN 1 ELSE 0 END) AS totalAciertos,
                ROUND(SUM(CASE WHEN rp.esCorrecta = 'S' THEN 1 ELSE 0 END) * 100.0 / COUNT(rr.idRegistroRespuesta), 2) AS porcentajeAciertos
             FROM pregun_fase pf
             JOIN regis_respu rr ON pf.idPregunta = rr.PREGUNTA_FASE_idPregunta
             JOIN resp_pregunta rp ON rr.RESPUESTA_PREGUNTA_idRespuesta = rp.idRespuesta
             GROUP BY pf.idPregunta, pf.numeroPregunta, pf.descPregunta
             ORDER BY porcentajeAciertos ASC
             FETCH FIRST 1 ROWS ONLY`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;