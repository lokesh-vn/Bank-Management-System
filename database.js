const express = require('express');
const mysql8 = require('mysql8');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

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


/*-----------------------------------------------------------------------For Table Register in database----------------------------------------------------------------------------*/

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


/*--------------------------------------------------------------------------For Table Bank in database-------------------------------------------------------------------------------*/

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


/*------------------------------------------------------------------------For Table Branch in database-------------------------------------------------------------------------------*/

// Route for submitting branch details
app.post('/branch-d', (req, res) => {
    const { branch_no, address, code } = req.body;
    const query = 'INSERT INTO bank_branch (branch_no, address, code) VALUES (?, ?, ?)';
    connection.query(query, [branch_no, address, code], (err, results) => {
        if (err) {
            console.error('Error submitting branch details:', err);
            res.status(500).send('Error Storing values due to Duplicate Entry');
            return;
        }
        //   res.status(200).send('Branch details submitted successfully');
        res.redirect('/branch-d.html');
    });
});

// Route for fetching all branch details
app.get('/branch-dr', (req, res) => {
    const query = 'SELECT * FROM bank_branch';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching branch details:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});


/*---------------------------------------------------------------------For Table Customer in database-------------------------------------------------------------------------------*/

app.post('/customer-d', (req, res) => {
    try {
        const { ssn, name, phone, address } = req.body;
        
        // Build the SQL update query dynamically
        let query = 'UPDATE customer SET ';
        let updateValues = [];
        
        // Check which fields are provided in the request body and add them to the update query
        if (name) {
            query += 'name=?, ';
            updateValues.push(name);
        }
        if (phone) {
            query += 'phone=?, ';
            updateValues.push(phone);
        }
        if (address) {
            query += 'address=?, ';
            updateValues.push(address);
        }

        // Remove the trailing comma and space from the query
        query = query.slice(0, -2);

        // Add the WHERE clause to specify the customer by SSN
        query += ' WHERE ssn=?';
        updateValues.push(ssn);

        // Execute the SQL update query
        connection.query(query, updateValues, (err, results) => {
            if (err) {
                console.error('Error updating customer:', err);
                res.status(500).json({ message: 'Error updating customer' });
                return;
            }
            // Check if any rows were affected by the update
            if (results.affectedRows > 0) {
                res.status(200).json({ message: 'Customer updated successfully' });
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ message: 'Error updating data' });
    }
});


// Route for viewing all customers
app.get('/customer-dr', (req, res) => {
    // SQL query to fetch all customers
    const query = 'SELECT * FROM customer';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});


/*---------------------------------------------------------------------For Table Account in database-------------------------------------------------------------------------------*/

// Route for submitting Account details
app.post('/account-d', (req, res) => {
    const { acc_no, balance, type, ssn, branch_no } = req.body;
    const query = 'INSERT INTO account (acc_no, balance, type, ssn, branch_no) VALUES (?, ?, ?,  ?, ?)';
    connection.query(query, [acc_no, balance, type, ssn, branch_no], (err, results) => {
        if (err) {
            console.error('Error submitting bank details:', err);
            res.status(500).send('Error Storing values due to Duplicate Entry');
            return;
        }
        //   res.status(200).send('Bank details submitted successfully');
        res.redirect('/account-d.html');
    });
});

// Route for fetching all Account details
app.get('/account-dr', (req, res) => {
    const query = 'SELECT * FROM account';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching bank details:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});


/*---------------------------------------------------------------------For Table Loan in database-------------------------------------------------------------------------------*/

// Route for deleting loan details
app.delete('/loan-d', (req, res) => {
    const loanNo = req.body.loan_no;

    const query = 'DELETE FROM loan WHERE loan_no = ?';
    connection.query(query, [loanNo], (err, result) => {
        if (err) {
            console.error('Error deleting loan:', err);
            res.status(500).send('Error deleting loan');
            return;
        }
        console.log('Loan deleted successfully');
        res.status(200).send('Loan deleted successfully');
    });
});

// Route for fetching all Loan details
app.get('/loan-dr', (req, res) => {
    const query = 'SELECT * FROM loan';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching branch details:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

/*-------------------------------------------------------------------------End of Queries-------------------------------------------------------------------------------------------*/

// To Display the stored register values
// connection.query("select * from register", (err,result,fields)=>{
//     if(err){
//         return console.log(err);
//     }
//     return console.log(result);
// })

// Start server
app.listen(port, () => {
    console.log(`Server running on port 127.0.0.1:${port}`);
});
