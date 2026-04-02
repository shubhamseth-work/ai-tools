const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  database: 'your_database_name'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL!');
});

// Run a query
connection.query('SELECT * FROM users', (err, results, fields) => {
  if (err) {
    console.error('Error executing query:', err);
    return;
  }
  console.log('Results:', results);
});

// Close the connection
connection.end();

module.exports = {connection};
