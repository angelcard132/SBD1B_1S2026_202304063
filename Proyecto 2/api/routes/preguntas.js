const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM PREGUNTAS ORDER BY ID_PREGUNTA`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM PREGUNTAS WHERE ID_PREGUNTA = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO PREGUNTAS (ID_PREGUNTA, PREGUNTA_TEXTO, RESPUESTA, RES1, RES2, RES3, RES4)
                 VALUES (seq_pregunta.NEXTVAL, :PREGUNTA_TEXTO, :RESPUESTA, :RES1, :RES2, :RES3, :RES4)
                 RETURNING ID_PREGUNTA INTO :id`,
                {
                    PREGUNTA_TEXTO: item.PREGUNTA_TEXTO,
                    RESPUESTA: item.RESPUESTA,
                    RES1: item.RES1 || null,
                    RES2: item.RES2 || null,
                    RES3: item.RES3 || null,
                    RES4: item.RES4 || null,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_PREGUNTA: result.outBinds.id[0] });
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
            `UPDATE PREGUNTAS SET PREGUNTA_TEXTO = :PREGUNTA_TEXTO, RESPUESTA = :RESPUESTA, RES1 = :RES1, RES2 = :RES2, RES3 = :RES3, RES4 = :RES4 WHERE ID_PREGUNTA = :id`,
            { PREGUNTA_TEXTO: req.body.PREGUNTA_TEXTO, RESPUESTA: req.body.RESPUESTA, RES1: req.body.RES1, RES2: req.body.RES2, RES3: req.body.RES3, RES4: req.body.RES4, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Pregunta actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM PREGUNTAS WHERE ID_PREGUNTA = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Pregunta eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;