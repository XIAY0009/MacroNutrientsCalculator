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
    password: 'xiayingyu',
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
        res.status(200).send({ success: true, userId: result.insertId });
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

// Endpoint to check if username or email already exists
app.post('/api/check_user', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send({ error: 'Missing name or email' });
    }

    const query = 'SELECT name, email FROM users WHERE name = ? OR email = ?';
    db.query(query, [name, email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        let usernameExists = false;
        let emailExists = false;
        results.forEach(row => {
            if (row.name === name) usernameExists = true;
            if (row.email === email) emailExists = true;
        });
        res.status(200).send({ usernameExists, emailExists });
    });
});

// Endpoint to check if username and email exist and match in the same row (for sign in)
app.post('/api/validate_signin', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send({ error: 'Missing name or email' });
    }

    // Query for a row where both name and email match
    const query = 'SELECT * FROM users WHERE name = ? AND email = ?';
    db.query(query, [name, email], (err, results) => {
        if (err) {
            console.error('Error validating sign in:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        if (results.length > 0) {
            // User exists and name/email match in the same row
            //res.status(200).send({ exists: true, match: true, userId: results[0].id });
            res.status(200).send({ exists: true, match: true, usernameExists: true, emailExists: true });
        } else {
            // Check if either name or email exists separately
            const checkQuery = 'SELECT * FROM users WHERE name = ? OR email = ?';
            db.query(checkQuery, [name, email], (err2, results2) => {
                if (err2) {
                    console.error('Error checking user:', err2);
                    return res.status(500).send({ error: 'Database error', details: err2.message });
                }
                let usernameExists = false;
                let emailExists = false;
                results2.forEach(row => {
                    if (row.name === name) usernameExists = true;
                    if (row.email === email) emailExists = true;
                });
                res.status(200).send({ exists: false, match: false, usernameExists, emailExists });
            });
        }
    });
});

app.get('/api/cart', (req, res) => {
    const userId = req.query.userId;
    console.log('Cart query for userId - ', userId); // Log the userId being queried
    if (!userId) {
        return res.status(400).send({ error: 'Missing userId' });
    }
    // Query for cart items
    const cartQuery = 'SELECT dish_name, quantity FROM cart WHERE user_id = ?';
    // Query for liked items
    const likesQuery = 'SELECT dish_name FROM likes WHERE user_id = ?';

    db.query(cartQuery, [userId], (cartErr, cartResults) => {
        if (cartErr) {
            console.error('Error fetching cart:', cartErr);
            return res.status(500).send({ error: 'Database error', details: cartErr.message });
        }
        console.log('cart items - ', cartResults);
        db.query(likesQuery, [userId], (likesErr, likesResults) => {
            if (likesErr) {
                console.error('Error fetching likes:', likesErr);
                return res.status(500).send({ error: 'Database error', details: likesErr.message });
            }
            res.status(200).send({
                cart: cartResults,
                likes: likesResults.map(row => row.dish_name)
            });
            console.log('like items - ', likesResults);
        });
        
    });
});

// Endpoint to get user_id by username
app.post('/api/getUserId', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send({ error: 'Missing username' });
    }
    const query = 'SELECT id FROM users WHERE name = ?';
    db.query(query, [name], (err, results) => {
        if (err) {
            console.error('Error fetching user_id:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send({ userId: results[0].id });
    });
});

// Endpoint to get daily targeted protein, carbohydrates, and fats for a user_id
app.get('/api/targets', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send({ error: 'Missing userId' });
    }
    const query = 'SELECT protein, carbohydrates, fats FROM calculations WHERE user_id = ? ORDER BY id DESC LIMIT 1';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching targets:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).send({ error: 'No targets found for this user' });
        }
        console.log('User daily targets - ', results[0]);
        res.status(200).send(results[0]);
    });
});


// Endpoint to get nutrition info for a list of dishes
app.post('/api/dishes/nutrition', (req, res) => {
    const { dishNames } = req.body;
    if (!dishNames || !Array.isArray(dishNames) || dishNames.length === 0) {
        return res.status(400).send({ error: 'Missing or invalid dishNames' });
    }
    const placeholders = dishNames.map(() => '?').join(',');
    const query = `SELECT name, carbs, proteins, fats FROM dishes WHERE name IN (${placeholders})`;
    db.query(query, dishNames, (err, results) => {
        if (err) {
            console.error('Error fetching dish nutrition:', err);
            return res.status(500).send({ error: 'Database error', details: err.message });
        }
        res.status(200).send(results);
    });
});

const { exec } = require('child_process');

app.post('/api/optimize-dishes', (req, res) => {
    const { userId, targetCarb, targetProtein, targetFat, cartItems, likedItems } = req.body;

    // Serialize cartItems and likedItems as JSON strings
    const cartItemsStr = JSON.stringify(cartItems);
    const likedItemsStr = JSON.stringify(likedItems);

    // Escape double quotes for safe command-line passing
    const safeCart = cartItemsStr.replace(/"/g, '\\"');
    const safeLike = likedItemsStr.replace(/"/g, '\\"');

    // Build the command
    const command = `python3 dishOptimizationCodeTryRemoveAndAddIntegrateWithLightFm.py ` +
        `${userId} ${targetCarb} ${targetProtein} ${targetFat} "${safeCart}" "${safeLike}"`;
    //const command = `python3 testCode.py`
    console.log ("command - ", command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || error.message });
        }
        try {
            const result = JSON.parse(stdout);
            res.json(result);
            console.log("result - ", result)
        } catch (e) {
            res.json({ output: stdout });
        }
    });
});

// Endpoint to update cart item quantity (insert/update/delete as needed)
app.post('/api/cart/update', (req, res) => {
    const { userId, dishName, quantity } = req.body;
    if (!userId || !dishName || typeof quantity !== 'number') {
        return res.status(400).send({ error: 'Missing parameters' });
    }
    // If quantity <= 0, remove the item from cart
    if (quantity <= 0) {
        const deleteQuery = 'DELETE FROM cart WHERE user_id = ? AND dish_name = ?';
        db.query(deleteQuery, [userId, dishName], (err, result) => {
            if (err) return res.status(500).send({ error: 'Database error', details: err.message });
            return res.status(200).send({ success: true });
        });
        return;
    }
    // Otherwise, insert or update the cart quantity
    const upsertQuery = `INSERT INTO cart (user_id, dish_name, quantity) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = ?`;
    db.query(upsertQuery, [userId, dishName, quantity, quantity], (err, result) => {
        if (err) return res.status(500).send({ error: 'Database error', details: err.message });
        return res.status(200).send({ success: true });
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
