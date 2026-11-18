const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM DEPARTAMENTO ORDER BY ID_DEPARTAMENTO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const data = Array.isArray(req.body) ? req.body : [req.body];
    try {
        conn = await getConnection();
        const inserted = [];
        for (const item of data) {
            const result = await conn.execute(
                `INSERT INTO DEPARTAMENTO (ID_DEPARTAMENTO, NOMBRE, CODIGO)
                 VALUES (seq_departamento.NEXTVAL, :NOMBRE, :CODIGO)
                 RETURNING ID_DEPARTAMENTO INTO :id`,
                {
                    NOMBRE: item.NOMBRE || item.nombre || null,
                    CODIGO: item.CODIGO || item.codigo || null,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_DEPARTAMENTO: result.outBinds.id[0], NOMBRE: item.NOMBRE || item.nombre });
        }
        res.status(201).json({ message: `${inserted.length} registro(s) creado(s)`, data: inserted });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE DEPARTAMENTO SET NOMBRE = :NOMBRE, CODIGO = :CODIGO WHERE ID_DEPARTAMENTO = :id`,
            { NOMBRE: req.body.NOMBRE, CODIGO: req.body.CODIGO, id: req.params.id },
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
        await conn.execute(`DELETE FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Departamento eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;