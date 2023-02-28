const express = require('express');
const oracledb = require('oracledb');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

console.log('get connection');

oracledb.getConnection(
    {
        user: 'hans',
        password: 'test',
        connectString:
            '(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = 172.17.0.1)(PORT = 1521))(CONNECT_DATA =(SERVER = DEDICATED)(SERVICE_NAME = XEPDB1)))',
    },
    function (err, connection) {
        console.log('open connection');
        if (err) {
            console.error(err);
            return;
        }

        app.listen(3000, () => console.log('Listening on port 3000'));

        connection.execute(
            'select id,name from hans.test',
            [],
            function (err, result) {
                console.log('klaar met select');
                if (err) {
                    error = err;
                    return;
                }

                id = result.rows[0][0];
                name = result.rows[0][1];

                error = null;
                console.log('resultaat id=', id, 'name=', name);
                connection.close(function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            },
        );
    },
);

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
