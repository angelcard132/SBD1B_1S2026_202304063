const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM GENERO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM GENERO WHERE idGenero = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { descripcionGenero } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO GENERO (idGenero, descripcionGenero) VALUES (seq_genero.NEXTVAL, :descripcionGenero) RETURNING idGenero INTO :id`,
            { descripcionGenero, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idGenero: result.outBinds.id[0], message: 'Género creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { descripcionGenero } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE GENERO SET descripcionGenero = :descripcionGenero WHERE idGenero = :id`,
            { descripcionGenero, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Género actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM GENERO WHERE idGenero = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Género eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;