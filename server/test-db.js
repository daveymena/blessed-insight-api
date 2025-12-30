const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://Postgres:6715320Dvd@164.68.122.5:5433/biblia-estudio?sslmode=disable',
});

client.connect()
    .then(() => {
        console.log('Connected successfully');
        return client.end();
    })
    .catch(err => {
        console.error('FULL ERROR:', JSON.stringify(err, null, 2));
        console.error('STACK:', err.stack);
        client.end();
    });
