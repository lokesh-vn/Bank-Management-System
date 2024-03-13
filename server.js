const{createPool} =require('mysql8');

const pool=createPool({
    host: 'localhost',
    user:'root',
    password: 'MySQL-database',
    database: 'bank',
    port: 3308,
    connectionLimit: 10,
})

pool.query("select * from login", (err,result,fields)=>{
    if(err){
        return console.log(err);
    }
    return console.log(result);
})





const express = require('express');
const mysql8 = require('mysql8');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql8.createConnection({
    host: 'localhost',
    user:'root',
    password: 'MySQL-database',
    database: 'bank',
    port: 3308,
    connectionLimit: 10,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;

    // Check if passwords match
    if (password !== confirm_password) {
        res.send('Passwords do not match');
        return;
    }

    // SQL query to insert registration values into the database
    const sql = 'INSERT INTO register (name, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.error('Error storing registration values: ' + err.stack);
            res.send('Error storing registration values');
        } else {
            console.log('Registration values stored successfully');
            res.send('Registration successful');
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

connection.query("select * from register", (err,result,fields)=>{
    if(err){
        return console.log(err);
    }
    return console.log(result);
})