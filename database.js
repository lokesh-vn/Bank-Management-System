const express = require('express');
const mysql8 = require('mysql8');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql8.createConnection({
    host: 'localhost',
    user: 'root',
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

app.use(express.static(__dirname));

//Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// app.post('/main', (req, res) => {});

//Routes

//Route for adding register values from register table

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
            // res.send('Registration successful');
            res.redirect('/login.html');
        }
    });
});

//Route for retreiving register values from register table
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // SQL query to check if user exists with the provided email and password
    const sql = 'SELECT * FROM register WHERE email = ? AND password = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying database: ' + err.stack);
            res.send('Error querying database');
        } else {
            if (results.length > 0) {
                //res.send('Login successful'); // User found, login successful
                res.redirect('/main.html'); 
            } else {
                res.send('Invalid email or password'); // No user found with provided credentials
            }
        }
    });
});

// Route for submitting bank details
app.post('/bank-d', (req, res) => {
    const { code, name, address } = req.body;
    const query = 'INSERT INTO bank (code, name, address) VALUES (?, ?, ?)';
    connection.query(query, [code, name, address], (err, results) => {
      if (err) {
        console.error('Error submitting bank details:', err);
        res.status(500).send('Error Storing values due to Duplicate Entry');
        return;
      }
    //   res.status(200).send('Bank details submitted successfully');
        res.redirect('/bank-d.html');
    });
  });
  
  // Route for fetching all bank details
  app.get('/bank-dr', (req, res) => {
    const query = 'SELECT * FROM bank';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching bank details:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });

// To Display the stored register values
// connection.query("select * from register", (err,result,fields)=>{
//     if(err){
//         return console.log(err);
//     }
//     return console.log(result);
// })

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
