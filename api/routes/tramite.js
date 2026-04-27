const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM TRAMITE_TIPO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM TRAMITE_TIPO WHERE idTipoTramite = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { descripcionTramite } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO TRAMITE_TIPO (idTipoTramite, descripcionTramite)
             VALUES (seq_tramite.NEXTVAL, :descripcionTramite) RETURNING idTipoTramite INTO :id`,
            { descripcionTramite, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idTipoTramite: result.outBinds.id[0], message: 'Trámite creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { descripcionTramite } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE TRAMITE_TIPO SET descripcionTramite = :descripcionTramite WHERE idTipoTramite = :id`,
            { descripcionTramite, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Trámite actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM TRAMITE_TIPO WHERE idTipoTramite = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Trámite eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;