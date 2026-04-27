const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM cenEscuela`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM cenEscuela WHERE idCentroEscuela = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { CENTRO_idCentro, Escuela_idEscuela } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO cenEscuela (idCentroEscuela, idCentro, idEscuela, fechaRegistro, CENTRO_idCentro, Escuela_idEscuela)
             VALUES (seq_cenescuela.NEXTVAL, :CENTRO_idCentro, :Escuela_idEscuela, SYSDATE, :CENTRO_idCentro, :Escuela_idEscuela)
             RETURNING idCentroEscuela INTO :id`,
            { CENTRO_idCentro, Escuela_idEscuela, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idCentroEscuela: result.outBinds.id[0], message: 'Relación Centro-Escuela creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { CENTRO_idCentro, Escuela_idEscuela } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE cenEscuela SET idCentro = :CENTRO_idCentro, idEscuela = :Escuela_idEscuela,
             CENTRO_idCentro = :CENTRO_idCentro, Escuela_idEscuela = :Escuela_idEscuela
             WHERE idCentroEscuela = :id`,
            { CENTRO_idCentro, Escuela_idEscuela, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Relación Centro-Escuela actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM cenEscuela WHERE idCentroEscuela = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Relación Centro-Escuela eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;