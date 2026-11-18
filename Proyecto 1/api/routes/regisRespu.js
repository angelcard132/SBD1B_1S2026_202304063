const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM regis_respu`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM regis_respu WHERE idRegistroRespuesta = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { registro_evaluacion_idRegistro, PREGUNTA_FASE_idPregunta, RESPUESTA_PREGUNTA_idRespuesta } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO regis_respu (idRegistroRespuesta, idRegistro, idPregunta, idRespuesta, fechaRegistro, registro_evaluacion_idRegistro, PREGUNTA_FASE_idPregunta, RESPUESTA_PREGUNTA_idRespuesta)
             VALUES (seq_regis_respu.NEXTVAL, :registro_evaluacion_idRegistro, :PREGUNTA_FASE_idPregunta, :RESPUESTA_PREGUNTA_idRespuesta, SYSDATE, :registro_evaluacion_idRegistro, :PREGUNTA_FASE_idPregunta, :RESPUESTA_PREGUNTA_idRespuesta)
             RETURNING idRegistroRespuesta INTO :id`,
            { registro_evaluacion_idRegistro, PREGUNTA_FASE_idPregunta, RESPUESTA_PREGUNTA_idRespuesta, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idRegistroRespuesta: result.outBinds.id[0], message: 'Registro de respuesta creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { registro_evaluacion_idRegistro, PREGUNTA_FASE_idPregunta, RESPUESTA_PREGUNTA_idRespuesta } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE regis_respu SET idRegistro = :registro_evaluacion_idRegistro,
             idPregunta = :PREGUNTA_FASE_idPregunta, idRespuesta = :RESPUESTA_PREGUNTA_idRespuesta,
             registro_evaluacion_idRegistro = :registro_evaluacion_idRegistro,
             PREGUNTA_FASE_idPregunta = :PREGUNTA_FASE_idPregunta,
             RESPUESTA_PREGUNTA_idRespuesta = :RESPUESTA_PREGUNTA_idRespuesta
             WHERE idRegistroRespuesta = :id`,
            { registro_evaluacion_idRegistro, PREGUNTA_FASE_idPregunta, RESPUESTA_PREGUNTA_idRespuesta, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Registro de respuesta actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM regis_respu WHERE idRegistroRespuesta = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Registro de respuesta eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;