const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idRespuesta, noRespuesta, descRespuesta, esCorrecta, valorRespuesta, idPregunta, PREGUNTA_FASE_idPregunta FROM resp_pregunta`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idRespuesta, noRespuesta, descRespuesta, esCorrecta, valorRespuesta, idPregunta, PREGUNTA_FASE_idPregunta FROM resp_pregunta WHERE idRespuesta = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { noRespuesta, descRespuesta, esCorrecta, valorRespuesta, PREGUNTA_FASE_idPregunta } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO resp_pregunta (idRespuesta, noRespuesta, descRespuesta, esCorrecta, valorRespuesta, idPregunta, PREGUNTA_FASE_idPregunta)
             VALUES (seq_respuesta.NEXTVAL, :noRespuesta, :descRespuesta, :esCorrecta, :valorRespuesta, :PREGUNTA_FASE_idPregunta, :PREGUNTA_FASE_idPregunta)
             RETURNING idRespuesta INTO :id`,
            { noRespuesta, descRespuesta, esCorrecta, valorRespuesta, PREGUNTA_FASE_idPregunta, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idRespuesta: result.outBinds.id[0], message: 'Respuesta creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { noRespuesta, descRespuesta, esCorrecta, valorRespuesta, PREGUNTA_FASE_idPregunta } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE resp_pregunta SET noRespuesta = :noRespuesta, descRespuesta = :descRespuesta,
             esCorrecta = :esCorrecta, valorRespuesta = :valorRespuesta,
             idPregunta = :PREGUNTA_FASE_idPregunta, PREGUNTA_FASE_idPregunta = :PREGUNTA_FASE_idPregunta
             WHERE idRespuesta = :id`,
            { noRespuesta, descRespuesta, esCorrecta, valorRespuesta, PREGUNTA_FASE_idPregunta, id: req.params.id },
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
        await conn.execute(`DELETE FROM resp_pregunta WHERE idRespuesta = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Respuesta eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;