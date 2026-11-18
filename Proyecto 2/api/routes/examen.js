const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM EXAMEN ORDER BY ID_EXAMEN`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM EXAMEN WHERE ID_EXAMEN = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO EXAMEN (ID_EXAMEN, REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID_MUNICIPIO, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, REGISTRO_ID_REGISTRO, CORRELATIVO_ID_CORRELATIVO)
                 VALUES (seq_examen.NEXTVAL, :REGISTRO_ID_ESCUELA, :REGISTRO_ID_CENTRO, :REGISTRO_MUNICIPIO_ID_MUNICIPIO, :REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, :REGISTRO_ID_REGISTRO, :CORRELATIVO_ID_CORRELATIVO)
                 RETURNING ID_EXAMEN INTO :id`,
                {
                    REGISTRO_ID_ESCUELA: item.REGISTRO_ID_ESCUELA,
                    REGISTRO_ID_CENTRO: item.REGISTRO_ID_CENTRO,
                    REGISTRO_MUNICIPIO_ID_MUNICIPIO: item.REGISTRO_MUNICIPIO_ID_MUNICIPIO,
                    REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO: item.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
                    REGISTRO_ID_REGISTRO: item.REGISTRO_ID_REGISTRO,
                    CORRELATIVO_ID_CORRELATIVO: item.CORRELATIVO_ID_CORRELATIVO,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_EXAMEN: result.outBinds.id[0] });
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
            `UPDATE EXAMEN SET REGISTRO_ID_ESCUELA = :REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO = :REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID_MUNICIPIO = :REGISTRO_MUNICIPIO_ID_MUNICIPIO, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = :REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, REGISTRO_ID_REGISTRO = :REGISTRO_ID_REGISTRO, CORRELATIVO_ID_CORRELATIVO = :CORRELATIVO_ID_CORRELATIVO WHERE ID_EXAMEN = :id`,
            { REGISTRO_ID_ESCUELA: req.body.REGISTRO_ID_ESCUELA, REGISTRO_ID_CENTRO: req.body.REGISTRO_ID_CENTRO, REGISTRO_MUNICIPIO_ID_MUNICIPIO: req.body.REGISTRO_MUNICIPIO_ID_MUNICIPIO, REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO: req.body.REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, REGISTRO_ID_REGISTRO: req.body.REGISTRO_ID_REGISTRO, CORRELATIVO_ID_CORRELATIVO: req.body.CORRELATIVO_ID_CORRELATIVO, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Examen actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM EXAMEN WHERE ID_EXAMEN = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Examen eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;