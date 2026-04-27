const oracledb = require('oracledb');
require('dotenv').config({ path: '../.env' });

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`
};

async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        return connection;
    } catch (err) {
        console.error('Error al conectar a Oracle:', err);
        throw err;
    }
}

module.exports = { getConnection };