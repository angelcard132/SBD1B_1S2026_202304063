const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM MUNICIPIO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM MUNICIPIO WHERE idMunicipio = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombreMunicipio, DEPARTAMENTO_idDepartamento } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO MUNICIPIO (idMunicipio, nombreMunicipio, idDepartamento, DEPARTAMENTO_idDepartamento)
             VALUES (seq_municipio.NEXTVAL, :nombreMunicipio, :DEPARTAMENTO_idDepartamento, :DEPARTAMENTO_idDepartamento)
             RETURNING idMunicipio INTO :id`,
            { nombreMunicipio, DEPARTAMENTO_idDepartamento, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idMunicipio: result.outBinds.id[0], message: 'Municipio creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombreMunicipio, DEPARTAMENTO_idDepartamento } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE MUNICIPIO SET nombreMunicipio = :nombreMunicipio,
             idDepartamento = :DEPARTAMENTO_idDepartamento,
             DEPARTAMENTO_idDepartamento = :DEPARTAMENTO_idDepartamento WHERE idMunicipio = :id`,
            { nombreMunicipio, DEPARTAMENTO_idDepartamento, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Municipio actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM MUNICIPIO WHERE idMunicipio = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Municipio eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;