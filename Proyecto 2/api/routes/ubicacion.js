const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM UBICACION ORDER BY ID_UBICACION`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM UBICACION WHERE ID_UBICACION = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO UBICACION (ID_UBICACION, ESCUELA_ID_ESCUELA, CENTRO_ID_CENTRO)
                 VALUES (seq_ubicacion.NEXTVAL, :ESCUELA_ID_ESCUELA, :CENTRO_ID_CENTRO)
                 RETURNING ID_UBICACION INTO :id`,
                {
                    ESCUELA_ID_ESCUELA: item.ESCUELA_ID_ESCUELA,
                    CENTRO_ID_CENTRO: item.CENTRO_ID_CENTRO,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_UBICACION: result.outBinds.id[0] });
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
            `UPDATE UBICACION SET ESCUELA_ID_ESCUELA = :ESCUELA_ID_ESCUELA, CENTRO_ID_CENTRO = :CENTRO_ID_CENTRO WHERE ID_UBICACION = :id`,
            { ESCUELA_ID_ESCUELA: req.body.ESCUELA_ID_ESCUELA, CENTRO_ID_CENTRO: req.body.CENTRO_ID_CENTRO, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Ubicacion actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM UBICACION WHERE ID_UBICACION = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Ubicacion eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;