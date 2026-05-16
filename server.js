const express = require('express');
const path = require('path');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3304),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'hospital_kpi'
};

const pool = mariadb.createPool({
  ...dbConfig,
  connectionLimit: 5
});

app.use(express.json());

async function ensureUsersTable() {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.query(`
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

    const existing = await conn.query('SELECT id FROM usuarios WHERE username = ? LIMIT 1', ['admin']);

    if (!existing.length) {
      const hash = await bcrypt.hash('admin', 10);
      await conn.query(
        'INSERT INTO usuarios (username, password_hash, nombre, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['admin', hash, 'Administrador HUS', 'admin', 1]
      );
      console.log('Usuario admin creado (credenciales: admin/admin).');
    }
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Usuario y contrasena son obligatorios.' });
  }

  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT id, username, password_hash, nombre, rol, activo FROM usuarios WHERE username = ? LIMIT 1',
      [username]
    );

    const user = rows[0];
    if (!user || !user.activo) {
      return res.status(401).json({ ok: false, message: 'Credenciales invalidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ ok: false, message: 'Credenciales invalidas.' });
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, message: 'No fue posible autenticar en este momento.' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/health', async (_req, res) => {
  try {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query('SELECT 1 AS ok');
    } finally {
      if (conn) {
        conn.release();
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index-new.html'));
});

(async () => {
  try {
    await ensureUsersTable();
    app.listen(PORT, () => {
      console.log(`Servidor listo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exit(1);
  }
})();
