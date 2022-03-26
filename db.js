const { Pool } = require('pg');

// creamos nuestro pool de conexiones
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'skatepark',
    password: '1234',
    max: 12,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function get_user(email) {
    const client = await pool.connect();

    const { rows } = await client.query({
        text: 'select * from skaters where email=$1',
        values: [email]
    })

    client.release();

    if (rows.length > 0) {
        return rows[0]
    }
    return undefined
}

async function create_user(email, name, password, anio_exper, especialidad, foto, estado) {
    const client = await pool.connect();
    await client.query({
        text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1, $2, $3, $4, $5, $6, $7)',
        values: [email, name, password, anio_exper, especialidad, foto, true]
    });

    client.release();
}

async function get_users() {
    const client = await pool.connect();

    const { rows } = await client.query('select * from skaters order by id');

    client.release();

    return rows
}

/**********************************************************************************************/

async function update(email, name, password, anio_exper, especialidad) {
    const client = await pool.connect();
    await client.query({
        text: 'update skaters set nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5  where email=$1',
        values: [email, name, password, anio_exper, especialidad]
    });

    client.release();
}

/**********************************************************************************************/
async function set_auth(user_id, new_auth) {
    const client = await pool.connect();

    await client.query({
        text: 'update users set auth=$2 where id=$1',
        values: [parseInt(user_id), new_auth]
    });

    client.release();
}

/**********************************************************************************************/
module.exports = {
    get_user,
    create_user,
    get_users,
    update
    // set_auth
}