const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM regis_evalua`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM regis_evalua WHERE idRegistro = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { correlativoDia, resultadoTeorico, resultadoPractico, usuarioRegistro, PERSONA_idPersona, CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia, TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO regis_evalua (idRegistro, fechaRegistro, correlativoDia, resultadoTeorico, resultadoPractico, usuarioRegistro, idPersona, idCentro, idTipoLicencia, idTipoTramite, idInstructor, PERSONA_idPersona, CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia, TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor)
             VALUES (seq_regis_evalua.NEXTVAL, SYSDATE, :correlativoDia, :resultadoTeorico, :resultadoPractico, :usuarioRegistro, :PERSONA_idPersona, :CENTRO_idCentro, :LICENCIA_TIPO_idTipoLicencia, :TRAMITE_TIPO_idTipoTramite, :INSTRUCTOR_idInstructor, :PERSONA_idPersona, :CENTRO_idCentro, :LICENCIA_TIPO_idTipoLicencia, :TRAMITE_TIPO_idTipoTramite, :INSTRUCTOR_idInstructor)
             RETURNING idRegistro INTO :id`,
            { correlativoDia, resultadoTeorico, resultadoPractico, usuarioRegistro, PERSONA_idPersona, CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia, TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idRegistro: result.outBinds.id[0], message: 'Registro de evaluación creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { correlativoDia, resultadoTeorico, resultadoPractico, usuarioRegistro, PERSONA_idPersona, CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia, TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE regis_evalua SET correlativoDia = :correlativoDia, resultadoTeorico = :resultadoTeorico,
             resultadoPractico = :resultadoPractico, usuarioRegistro = :usuarioRegistro,
             idPersona = :PERSONA_idPersona, idCentro = :CENTRO_idCentro,
             idTipoLicencia = :LICENCIA_TIPO_idTipoLicencia, idTipoTramite = :TRAMITE_TIPO_idTipoTramite,
             idInstructor = :INSTRUCTOR_idInstructor, PERSONA_idPersona = :PERSONA_idPersona,
             CENTRO_idCentro = :CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia = :LICENCIA_TIPO_idTipoLicencia,
             TRAMITE_TIPO_idTipoTramite = :TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor = :INSTRUCTOR_idInstructor
             WHERE idRegistro = :id`,
            { correlativoDia, resultadoTeorico, resultadoPractico, usuarioRegistro, PERSONA_idPersona, CENTRO_idCentro, LICENCIA_TIPO_idTipoLicencia, TRAMITE_TIPO_idTipoTramite, INSTRUCTOR_idInstructor, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Registro de evaluación actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM regis_evalua WHERE idRegistro = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Registro de evaluación eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;