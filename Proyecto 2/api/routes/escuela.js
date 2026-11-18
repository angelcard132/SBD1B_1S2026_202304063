const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM ESCUELA ORDER BY ID_ESCUELA`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM ESCUELA WHERE ID_ESCUELA = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO ESCUELA (ID_ESCUELA, NOMBRE, DIRECCION, ACUERDO)
                 VALUES (seq_escuela.NEXTVAL, :NOMBRE, :DIRECCION, :ACUERDO)
                 RETURNING ID_ESCUELA INTO :id`,
                {
                    NOMBRE: item.NOMBRE || item.nombre,
                    DIRECCION: item.DIRECCION || item.direccion || null,
                    ACUERDO: item.ACUERDO || item.acuerdo || null,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_ESCUELA: result.outBinds.id[0], NOMBRE: item.NOMBRE || item.nombre });
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
            `UPDATE ESCUELA SET NOMBRE = :NOMBRE, DIRECCION = :DIRECCION, ACUERDO = :ACUERDO WHERE ID_ESCUELA = :id`,
            { NOMBRE: req.body.NOMBRE, DIRECCION: req.body.DIRECCION, ACUERDO: req.body.ACUERDO, id: req.params.id },
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
        await conn.execute(`DELETE FROM ESCUELA WHERE ID_ESCUELA = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Escuela eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;