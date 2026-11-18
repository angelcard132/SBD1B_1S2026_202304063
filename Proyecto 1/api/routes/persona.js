const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idPersona, nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, idGenero, idMunicipio, idEscuela, fechaRegistro, usuarioRegistro, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio FROM PERSONA`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT idPersona, nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, idGenero, idMunicipio, idEscuela, fechaRegistro, usuarioRegistro, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio FROM PERSONA WHERE idPersona = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO PERSONA (idPersona, nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, idGenero, idMunicipio, idEscuela, fechaRegistro, usuarioRegistro, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio)
             VALUES (seq_persona.NEXTVAL, :nombrePersona, :identificacion, :direccionPersona, :telefono, TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'), :GENERO_idGenero, :MUNICIPIO_idMunicipio, :Escuela_idEscuela, SYSDATE, :usuarioRegistro, :Escuela_idEscuela, :GENERO_idGenero, :MUNICIPIO_idMunicipio)
             RETURNING idPersona INTO :id`,
            { nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio, usuarioRegistro, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idPersona: result.outBinds.id[0], message: 'Persona creada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio, usuarioRegistro } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE PERSONA SET nombrePersona = :nombrePersona, identificacion = :identificacion,
             direccionPersona = :direccionPersona, telefono = :telefono,
             fechaNacimiento = TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'),
             idGenero = :GENERO_idGenero, idMunicipio = :MUNICIPIO_idMunicipio, idEscuela = :Escuela_idEscuela,
             usuarioRegistro = :usuarioRegistro, Escuela_idEscuela = :Escuela_idEscuela,
             GENERO_idGenero = :GENERO_idGenero, MUNICIPIO_idMunicipio = :MUNICIPIO_idMunicipio
             WHERE idPersona = :id`,
            { nombrePersona, identificacion, direccionPersona, telefono, fechaNacimiento, Escuela_idEscuela, GENERO_idGenero, MUNICIPIO_idMunicipio, usuarioRegistro, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Persona actualizada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM PERSONA WHERE idPersona = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Persona eliminada' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;