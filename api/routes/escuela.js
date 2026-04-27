const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM Escuela`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM Escuela WHERE idEscuela = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombreEscuela, direccionEscuela, autorizacionNo, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO Escuela (idEscuela, nombreEscuela, direccionEscuela, autorizacionNo, fechaRegistro, usuarioRegistro)
             VALUES (seq_escuela.NEXTVAL, :nombreEscuela, :direccionEscuela, :autorizacionNo, SYSDATE, :usuarioRegistro)
             RETURNING idEscuela INTO :id`,
            { nombreEscuela, direccionEscuela, autorizacionNo, usuarioRegistro, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idEscuela: result.outBinds.id[0], message: 'Escuela creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombreEscuela, direccionEscuela, autorizacionNo, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE Escuela SET nombreEscuela = :nombreEscuela, direccionEscuela = :direccionEscuela,
             autorizacionNo = :autorizacionNo, usuarioRegistro = :usuarioRegistro WHERE idEscuela = :id`,
            { nombreEscuela, direccionEscuela, autorizacionNo, usuarioRegistro, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Escuela actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM Escuela WHERE idEscuela = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Escuela eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;