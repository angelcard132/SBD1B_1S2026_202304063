const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

// GET ALL
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT * FROM CENTRO`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// GET BY ID
router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT * FROM CENTRO WHERE idCentro = :id`,
            [req.params.id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// POST
router.post('/', async (req, res) => {
    let conn;
    const { nombreCentro, direccionCentro, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO CENTRO (idCentro, nombreCentro, direccionCentro, fechaRegistro, usuarioRegistro)
             VALUES (seq_centro.NEXTVAL, :nombreCentro, :direccionCentro, SYSDATE, :usuarioRegistro)
             RETURNING idCentro INTO :id`,
            {
                nombreCentro,
                direccionCentro,
                usuarioRegistro,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: true }
        );
        res.status(201).json({ idCentro: result.outBinds.id[0], message: 'Centro creado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// PUT
router.put('/:id', async (req, res) => {
    let conn;
    const { nombreCentro, direccionCentro, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE CENTRO SET nombreCentro = :nombreCentro, direccionCentro = :direccionCentro,
             usuarioRegistro = :usuarioRegistro WHERE idCentro = :id`,
            { nombreCentro, direccionCentro, usuarioRegistro, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Centro actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `DELETE FROM CENTRO WHERE idCentro = :id`,
            [req.params.id],
            { autoCommit: true }
        );
        res.json({ message: 'Centro eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

module.exports = router;