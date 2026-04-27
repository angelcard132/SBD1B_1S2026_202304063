const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idPregunta, numeroPregunta, descPregunta, idFase, FASE_EVALUACION_idFase FROM pregun_fase`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idPregunta, numeroPregunta, descPregunta, idFase, FASE_EVALUACION_idFase FROM pregun_fase WHERE idPregunta = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { numeroPregunta, descPregunta, FASE_EVALUACION_idFase } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO pregun_fase (idPregunta, numeroPregunta, descPregunta, idFase, FASE_EVALUACION_idFase)
             VALUES (seq_pregunta.NEXTVAL, :numeroPregunta, :descPregunta, :FASE_EVALUACION_idFase, :FASE_EVALUACION_idFase)
             RETURNING idPregunta INTO :id`,
            { numeroPregunta, descPregunta, FASE_EVALUACION_idFase, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idPregunta: result.outBinds.id[0], message: 'Pregunta creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { numeroPregunta, descPregunta, FASE_EVALUACION_idFase } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE pregun_fase SET numeroPregunta = :numeroPregunta, descPregunta = :descPregunta,
             idFase = :FASE_EVALUACION_idFase, FASE_EVALUACION_idFase = :FASE_EVALUACION_idFase WHERE idPregunta = :id`,
            { numeroPregunta, descPregunta, FASE_EVALUACION_idFase, id: req.params.id },
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
        await conn.execute(`DELETE FROM pregun_fase WHERE idPregunta = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Pregunta eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;