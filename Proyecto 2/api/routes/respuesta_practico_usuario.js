const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM RESPUESTA_PRACTICO_USUARIO ORDER BY ID_RESPUESTA_PRACTICO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM RESPUESTA_PRACTICO_USUARIO WHERE ID_RESPUESTA_PRACTICO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const data = Array.isArray(req.body) ? req.body : [req.body];
    try {
        conn = await getConnection();
        const inserted = [];
        for (const item of data) {
            const result = await conn.execute(
                `INSERT INTO RESPUESTA_PRACTICO_USUARIO (ID_RESPUESTA_PRACTICO, PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO, EXAMEN_ID_EXAMEN, NOTA)
                 VALUES (seq_resp_prac.NEXTVAL, :PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO, :EXAMEN_ID_EXAMEN, :NOTA)
                 RETURNING ID_RESPUESTA_PRACTICO INTO :id`,
                {
                    PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO: item.PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO,
                    EXAMEN_ID_EXAMEN: item.EXAMEN_ID_EXAMEN,
                    NOTA: item.NOTA,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_RESPUESTA_PRACTICO: result.outBinds.id[0] });
        }
        res.status(201).json({ message: `${inserted.length} registro(s) creado(s)`, data: inserted });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE RESPUESTA_PRACTICO_USUARIO SET PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO = :PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO, EXAMEN_ID_EXAMEN = :EXAMEN_ID_EXAMEN, NOTA = :NOTA WHERE ID_RESPUESTA_PRACTICO = :id`,
            { PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO: req.body.PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO, EXAMEN_ID_EXAMEN: req.body.EXAMEN_ID_EXAMEN, NOTA: req.body.NOTA, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Respuesta practica actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM RESPUESTA_PRACTICO_USUARIO WHERE ID_RESPUESTA_PRACTICO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Respuesta practica eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;