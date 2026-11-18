const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM RESPUESTA_USUARIO ORDER BY ID_RESPUESTA_USUARIO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM RESPUESTA_USUARIO WHERE ID_RESPUESTA_USUARIO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO RESPUESTA_USUARIO (ID_RESPUESTA_USUARIO, PREGUNTA_ID_PREGUNTA, EXAMEN_ID_EXAMEN, RESPUESTA)
                 VALUES (seq_resp_user.NEXTVAL, :PREGUNTA_ID_PREGUNTA, :EXAMEN_ID_EXAMEN, :RESPUESTA)
                 RETURNING ID_RESPUESTA_USUARIO INTO :id`,
                {
                    PREGUNTA_ID_PREGUNTA: item.PREGUNTA_ID_PREGUNTA,
                    EXAMEN_ID_EXAMEN: item.EXAMEN_ID_EXAMEN,
                    RESPUESTA: item.RESPUESTA,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_RESPUESTA_USUARIO: result.outBinds.id[0] });
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
            `UPDATE RESPUESTA_USUARIO SET PREGUNTA_ID_PREGUNTA = :PREGUNTA_ID_PREGUNTA, EXAMEN_ID_EXAMEN = :EXAMEN_ID_EXAMEN, RESPUESTA = :RESPUESTA WHERE ID_RESPUESTA_USUARIO = :id`,
            { PREGUNTA_ID_PREGUNTA: req.body.PREGUNTA_ID_PREGUNTA, EXAMEN_ID_EXAMEN: req.body.EXAMEN_ID_EXAMEN, RESPUESTA: req.body.RESPUESTA, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Respuesta actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM RESPUESTA_USUARIO WHERE ID_RESPUESTA_USUARIO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Respuesta eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;