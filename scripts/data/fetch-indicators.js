const mariadb = require('mariadb');

async function main() {
  let connection;

  try {
    connection = await mariadb.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '123456',
      port: 3304,
      database: 'hospital_kpi'
    });

    console.log('Conexión exitosa a la base de datos');

    const results = await connection.query('SELECT COUNT(*) AS total_indicadores FROM indicadores');
    const total = Number(results[0].total_indicadores);
    console.log('Total de indicadores:', total);
  } catch (error) {
    console.error('Error al conectar o consultar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada correctamente');
    }
  }
}

main();