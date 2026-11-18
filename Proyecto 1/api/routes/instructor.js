const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM instruc`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM instruc WHERE idInstructor = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombreInstructor, identificacion, CENTRO_idCentro, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO instruc (idInstructor, nombreInstructor, identificacion, idCentro, fechaRegistro, usuarioRegistro, CENTRO_idCentro)
             VALUES (seq_instructor.NEXTVAL, :nombreInstructor, :identificacion, :CENTRO_idCentro, SYSDATE, :usuarioRegistro, :CENTRO_idCentro)
             RETURNING idInstructor INTO :id`,
            { nombreInstructor, identificacion, CENTRO_idCentro, usuarioRegistro, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idInstructor: result.outBinds.id[0], message: 'Instructor creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombreInstructor, identificacion, CENTRO_idCentro, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE instruc SET nombreInstructor = :nombreInstructor, identificacion = :identificacion,
             idCentro = :CENTRO_idCentro, usuarioRegistro = :usuarioRegistro, CENTRO_idCentro = :CENTRO_idCentro
             WHERE idInstructor = :id`,
            { nombreInstructor, identificacion, CENTRO_idCentro, usuarioRegistro, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Instructor actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM instruc WHERE idInstructor = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Instructor eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;