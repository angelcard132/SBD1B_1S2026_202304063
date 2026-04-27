const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM DEPARTAMENTO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM DEPARTAMENTO WHERE idDepartamento = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombreDepartamento } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO DEPARTAMENTO (idDepartamento, nombreDepartamento)
             VALUES (seq_departamento.NEXTVAL, :nombreDepartamento) RETURNING idDepartamento INTO :id`,
            { nombreDepartamento, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idDepartamento: result.outBinds.id[0], message: 'Departamento creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombreDepartamento } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE DEPARTAMENTO SET nombreDepartamento = :nombreDepartamento WHERE idDepartamento = :id`,
            { nombreDepartamento, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Departamento actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM DEPARTAMENTO WHERE idDepartamento = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Departamento eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;