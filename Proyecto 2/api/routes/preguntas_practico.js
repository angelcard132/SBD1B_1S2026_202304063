const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM PREGUNTAS_PRACTICO ORDER BY ID_PREGUNTA_PRACTICO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO PREGUNTAS_PRACTICO (ID_PREGUNTA_PRACTICO, PREGUNTA_TEXTO, PUNTEO)
                 VALUES (seq_preg_prac.NEXTVAL, :PREGUNTA_TEXTO, :PUNTEO)
                 RETURNING ID_PREGUNTA_PRACTICO INTO :id`,
                {
                    PREGUNTA_TEXTO: item.PREGUNTA_TEXTO,
                    PUNTEO: item.PUNTEO,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_PREGUNTA_PRACTICO: result.outBinds.id[0] });
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
            `UPDATE PREGUNTAS_PRACTICO SET PREGUNTA_TEXTO = :PREGUNTA_TEXTO, PUNTEO = :PUNTEO WHERE ID_PREGUNTA_PRACTICO = :id`,
            { PREGUNTA_TEXTO: req.body.PREGUNTA_TEXTO, PUNTEO: req.body.PUNTEO, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Pregunta practica actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM PREGUNTAS_PRACTICO WHERE ID_PREGUNTA_PRACTICO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Pregunta practica eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;