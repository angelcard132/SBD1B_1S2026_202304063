const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM LICENCIA_TIPO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM LICENCIA_TIPO WHERE idTipoLicencia = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { codigoLicencia, descripcionLicencia } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO LICENCIA_TIPO (idTipoLicencia, codigoLicencia, descripcionLicencia)
             VALUES (seq_licencia.NEXTVAL, :codigoLicencia, :descripcionLicencia) RETURNING idTipoLicencia INTO :id`,
            { codigoLicencia, descripcionLicencia, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idTipoLicencia: result.outBinds.id[0], message: 'Licencia creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { codigoLicencia, descripcionLicencia } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE LICENCIA_TIPO SET codigoLicencia = :codigoLicencia, descripcionLicencia = :descripcionLicencia WHERE idTipoLicencia = :id`,
            { codigoLicencia, descripcionLicencia, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Licencia actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM LICENCIA_TIPO WHERE idTipoLicencia = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Licencia eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;