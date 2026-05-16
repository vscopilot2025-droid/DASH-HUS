const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3304),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'hospital_kpi'
};

async function setupUsersTable() {
  let connection;

  try {
    connection = await mariadb.createConnection(dbConfig);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(60) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(120) NOT NULL,
        rol VARCHAR(40) NOT NULL DEFAULT 'admin',
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const users = await connection.query('SELECT id FROM usuarios WHERE username = ? LIMIT 1', ['admin']);
    if (!users.length) {
      const hash = await bcrypt.hash('admin', 10);
      await connection.query(
        'INSERT INTO usuarios (username, password_hash, nombre, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['admin', hash, 'Administrador HUS', 'admin', 1]
      );
      console.log('Usuario admin/admin creado correctamente.');
    } else {
      console.log('El usuario admin ya existe.');
    }

    const countRows = await connection.query('SELECT COUNT(*) AS total FROM usuarios');
    console.log('Total usuarios:', Number(countRows[0].total));
  } catch (error) {
    console.error('Error creando tabla de usuarios:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupUsersTable();
