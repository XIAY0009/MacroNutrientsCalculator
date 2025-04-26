const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');



// Enable CORS for all routes
//app.use(cors({
//    origin: 'http://localhost:5500', // Replace with the origin of your frontend
//    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//    allowedHeaders: ['Content-Type', 'Authorization'],
//    credentials: true
//}));

// Enable CORS for all origins
app.use(cors());


app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'macronutrients_calculator'
});

// Establish database connection
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the application if the database connection fails
    } else {
        console.log('Connected to the MySQL database.');
    }
});

// Endpoint to save user data from landing.html
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(query, [name, email], (err, result) => {
        if (err) {
            console.error('Error inserting user data:', err); // Log the error
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        res.status(200).send({ userId: result.insertId });
    });
});

// Endpoint to save user data and calculations from index.html
app.post('/api/calculations', (req, res) => {
    const { userId, weight, height, age, gender, activity_level, fat_mass, goal, other_goal, protein, carbohydrates, fats } = req.body;
    const query = `
        INSERT INTO calculations (user_id, weight, height, age, gender, activity_level, fat_mass, goal, other_goal, protein, carbohydrates, fats)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [userId, weight, height, age, gender, activity_level, fat_mass, goal, other_goal, protein, carbohydrates, fats], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ calculationId: result.insertId });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
