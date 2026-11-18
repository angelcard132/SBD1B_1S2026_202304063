const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM REGISTRO ORDER BY ID_REGISTRO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM REGISTRO WHERE ID_REGISTRO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
                `INSERT INTO REGISTRO (ID_REGISTRO, UBICACION_ESCUELA_ID_ESCUELA, UBICACION_CENTRO_ID_CENTRO, MUNICIPIO_ID_MUNICIPIO, MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, FECHA, TIPO_TRAMITE, TIPO_LICENCIA, NOMBRE_COMPLETO, GENERO)
                 VALUES (seq_registro.NEXTVAL, :UBICACION_ESCUELA_ID_ESCUELA, :UBICACION_CENTRO_ID_CENTRO, :MUNICIPIO_ID_MUNICIPIO, :MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, TO_DATE(:FECHA, 'YYYY-MM-DD'), :TIPO_TRAMITE, :TIPO_LICENCIA, :NOMBRE_COMPLETO, :GENERO)
                 RETURNING ID_REGISTRO INTO :id`,
                {
                    UBICACION_ESCUELA_ID_ESCUELA: item.UBICACION_ESCUELA_ID_ESCUELA,
                    UBICACION_CENTRO_ID_CENTRO: item.UBICACION_CENTRO_ID_CENTRO,
                    MUNICIPIO_ID_MUNICIPIO: item.MUNICIPIO_ID_MUNICIPIO,
                    MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO: item.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO,
                    FECHA: item.FECHA,
                    TIPO_TRAMITE: item.TIPO_TRAMITE || null,
                    TIPO_LICENCIA: item.TIPO_LICENCIA || null,
                    NOMBRE_COMPLETO: item.NOMBRE_COMPLETO || null,
                    GENERO: item.GENERO || null,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            inserted.push({ ID_REGISTRO: result.outBinds.id[0] });
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
            `UPDATE REGISTRO SET UBICACION_ESCUELA_ID_ESCUELA = :UBICACION_ESCUELA_ID_ESCUELA, UBICACION_CENTRO_ID_CENTRO = :UBICACION_CENTRO_ID_CENTRO, MUNICIPIO_ID_MUNICIPIO = :MUNICIPIO_ID_MUNICIPIO, MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO = :MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, FECHA = TO_DATE(:FECHA, 'YYYY-MM-DD'), TIPO_TRAMITE = :TIPO_TRAMITE, TIPO_LICENCIA = :TIPO_LICENCIA, NOMBRE_COMPLETO = :NOMBRE_COMPLETO, GENERO = :GENERO WHERE ID_REGISTRO = :id`,
            { UBICACION_ESCUELA_ID_ESCUELA: req.body.UBICACION_ESCUELA_ID_ESCUELA, UBICACION_CENTRO_ID_CENTRO: req.body.UBICACION_CENTRO_ID_CENTRO, MUNICIPIO_ID_MUNICIPIO: req.body.MUNICIPIO_ID_MUNICIPIO, MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO: req.body.MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO, FECHA: req.body.FECHA, TIPO_TRAMITE: req.body.TIPO_TRAMITE, TIPO_LICENCIA: req.body.TIPO_LICENCIA, NOMBRE_COMPLETO: req.body.NOMBRE_COMPLETO, GENERO: req.body.GENERO, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Registro actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM REGISTRO WHERE ID_REGISTRO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Registro eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;