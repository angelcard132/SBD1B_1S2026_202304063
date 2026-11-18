const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM fas_evalua`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM fas_evalua WHERE idFase = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { descripcionFase, totalPreguntas, valorPorPregunta } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO fas_evalua (idFase, descripcionFase, totalPreguntas, valorPorPregunta)
             VALUES (seq_fase.NEXTVAL, :descripcionFase, :totalPreguntas, :valorPorPregunta)
             RETURNING idFase INTO :id`,
            { descripcionFase, totalPreguntas, valorPorPregunta, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idFase: result.outBinds.id[0], message: 'Fase creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { descripcionFase, totalPreguntas, valorPorPregunta } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE fas_evalua SET descripcionFase = :descripcionFase,
             totalPreguntas = :totalPreguntas, valorPorPregunta = :valorPorPregunta WHERE idFase = :id`,
            { descripcionFase, totalPreguntas, valorPorPregunta, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Fase actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM fas_evalua WHERE idFase = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Fase eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;