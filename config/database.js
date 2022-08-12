require('dotenv').config();

const options = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: 'remember##',
        database: 'lendsqr'
    },
    pool: { min: 0, max: 10 }
};

const knex = require('knex')(options);
knex.raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => { console.log(err); throw err });

module.exports = knex;
