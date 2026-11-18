const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db/connection');

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM MUNICIPIO ORDER BY ID_MUNICIPIO`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

router.get('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(`SELECT * FROM MUNICIPIO WHERE ID_MUNICIPIO = :id`, [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
      const departamentoId =
        item.DEPARTAMENTO_ID_DEPARTAMENTO ??
        item.departamento_id_departamento ??
        item.departamentoId;

      if (!departamentoId) {
        return res.status(400).json({
          error: 'Falta DEPARTAMENTO_ID_DEPARTAMENTO'
        });
      }

      const result = await conn.execute(
        `INSERT INTO MUNICIPIO (
            ID_MUNICIPIO,
            DEPARTAMENTO_ID_DEPARTAMENTO,
            NOMBRE,
            CODIGO
          )
          VALUES (
            seq_municipio.NEXTVAL,
            :DEPARTAMENTO_ID_DEPARTAMENTO,
            :NOMBRE,
            :CODIGO
          )
          RETURNING ID_MUNICIPIO INTO :id`,
        {
          DEPARTAMENTO_ID_DEPARTAMENTO: departamentoId,
          NOMBRE: item.NOMBRE ?? item.nombre,
          CODIGO: item.CODIGO ?? item.codigo ?? null,
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );

      inserted.push({
        ID_MUNICIPIO: result.outBinds.id[0],
        NOMBRE: item.NOMBRE ?? item.nombre,
        DEPARTAMENTO_ID_DEPARTAMENTO: departamentoId
      });
    }

    res.status(201).json({
      message: `${inserted.length} registro(s) creado(s)`,
      data: inserted
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

router.put('/:id', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `UPDATE MUNICIPIO SET NOMBRE = :NOMBRE, CODIGO = :CODIGO, DEPARTAMENTO_ID_DEPARTAMENTO = :DEPARTAMENTO_ID_DEPARTAMENTO WHERE ID_MUNICIPIO = :id`,
            { NOMBRE: req.body.NOMBRE, CODIGO: req.body.CODIGO, DEPARTAMENTO_ID_DEPARTAMENTO: req.body.DEPARTAMENTO_ID_DEPARTAMENTO, id: req.params.id },
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
        await conn.execute(`DELETE FROM MUNICIPIO WHERE ID_MUNICIPIO = :id`, [req.params.id], { autoCommit: true });
        res.json({ message: 'Municipio eliminado' });
    } catch (err) { res.status(500).json({ error: err.message });
    } finally { if (conn) await conn.close(); }
});

module.exports = router;