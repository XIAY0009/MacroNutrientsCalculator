const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');

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

// Endpoint to save liked dishes
app.post('/api/likeDish', (req, res) => {
    const { userId, dishName } = req.body;

    // Validate input
    if (!userId || !dishName) {
        return res.status(400).send({ error: 'Missing userId or dishName' });
    }

    // Check if the dish is already liked
    const checkQuery = 'SELECT * FROM likes WHERE user_id = ? AND dish_name = ?';
    db.query(checkQuery, [userId, dishName], (err, results) => {
        if (err) {
            console.error('Error checking like status:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }

        if (results.length > 0) {
            return res.status(400).send({ error: 'Dish is already liked.' });
        }

        // Add the like to the database
        const query = 'INSERT INTO likes (user_id, dish_name) VALUES (?, ?)';
        db.query(query, [userId, dishName], (err, result) => {
            if (err) {
                console.error('Error saving like:', err);
                return res.status(500).send({ error: 'Database error', details: err.message });
            }
            res.status(200).send({ likeId: result.insertId, message: 'Dish liked successfully!' });
        });
    });
});
//app.post('/api/likeDish', (req, res) => {
//    const { userId, dishName } = req.body;
//
//    // Validate input
//    if (!userId || !dishName) {
//        return res.status(400).send({ error: 'Missing userId or dishName' });
//    }
//
//    const query = 'INSERT INTO likes (user_id, dish_name) VALUES (?, ?)';
//    db.query(query, [userId, dishName], (err, result) => {
//        if (err) {
//            console.error('Error saving like:', err);
//            return res.status(500).send({ error: 'Database error', details: err.message });
//        }
//        res.status(200).send({ likeId: result.insertId, message: 'Dish liked successfully!' });
//    });
//});

app.post('/api/unlikeDish', (req, res) => {
    const { userId, dishName } = req.body;

    // Validate input
    if (!userId || !dishName) {
        return res.status(400).send({ error: 'Missing userId or dishName' });
    }

    // Remove the like from the database
    const query = 'DELETE FROM likes WHERE user_id = ? AND dish_name = ?';
    db.query(query, [userId, dishName], (err, result) => {
        if (err) {
            console.error('Error removing like:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Like not found.' });
        }
        res.status(200).send({ message: 'Dish unliked successfully!' });
    });
});

app.post('/api/addToCart', (req, res) => {
    const { userId, dishName, quantity } = req.body;

    // Validate input
    if (!userId || !dishName || !quantity || quantity < 1) {
        return res.status(400).send({ error: 'Invalid input. Please provide userId, dishName, and a valid quantity.' });
    }

    const query = 'INSERT INTO cart (user_id, dish_name, quantity) VALUES (?, ?, ?)';
    db.query(query, [userId, dishName, quantity], (err, result) => {
        if (err) {
            console.error('Error adding to cart:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        res.status(200).send({ cartId: result.insertId, message: 'Item added to cart successfully!' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
