const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'demo_development',
  password: 'root',
  port: 5432,
})

exports.pool = pool;