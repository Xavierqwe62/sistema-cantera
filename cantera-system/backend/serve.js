const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '987654-serV',
    database: 'cantera_db'
});

conexion.connect((err) => {

    if(err){
        console.log(err);
    }else{
        console.log('MySQL conectado');
    }

});

app.get('/productos', (req, res) => {

    conexion.query(
        'SELECT * FROM productos',
        (err, results) => {

            if(err){
                res.status(500).send(err);
            }else{
                res.json(results);
            }

        }
    );

});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});