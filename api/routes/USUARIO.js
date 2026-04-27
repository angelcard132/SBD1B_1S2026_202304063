const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM USUARIO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM USUARIO WHERE idUsuario = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.post('/', async (req, res) => {
    let conn;
    const { nombreUsuario, contrasenia, estadoUsuario, ROL_idRol } = req.body;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO USUARIO (idUsuario, nombreUsuario, contrasenia, estadoUsuario, idRol, fechaRegistro, ROL_idRol)
             VALUES (seq_usuario.NEXTVAL, :nombreUsuario, :contrasenia, :estadoUsuario, :ROL_idRol, SYSDATE, :ROL_idRol)
             RETURNING idUsuario INTO :id`,
            { nombreUsuario, contrasenia, estadoUsuario, ROL_idRol, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        res.status(201).json({ idUsuario: result.outBinds.id[0], message: 'Usuario creado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.put('/:id', async (req, res) => {
    let conn;
    const { nombreUsuario, contrasenia, estadoUsuario, ROL_idRol } = req.body;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE USUARIO SET nombreUsuario = :nombreUsuario, contrasenia = :contrasenia,
             estadoUsuario = :estadoUsuario, idRol = :ROL_idRol, ROL_idRol = :ROL_idRol WHERE idUsuario = :id`,
            { nombreUsuario, contrasenia, estadoUsuario, ROL_idRol, id: req.params.id },
            { autoCommit: true }
        );
        res.json({ message: 'Usuario actualizado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.delete('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(`DELETE FROM USUARIO WHERE idUsuario = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Usuario eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;