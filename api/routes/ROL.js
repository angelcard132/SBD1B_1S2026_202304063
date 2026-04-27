const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM ROL`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM ROL WHERE idRol = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { descripcionRol } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO ROL (idRol, descripcionRol) VALUES (seq_rol.NEXTVAL, :descripcionRol) RETURNING idRol INTO :id`,
            { descripcionRol, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idRol: result.outBinds.id[0], message: 'Rol creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { descripcionRol } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE ROL SET descripcionRol = :descripcionRol WHERE idRol = :id`,
            { descripcionRol, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Rol actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM ROL WHERE idRol = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Rol eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;