CREATE DATABASE macronutrients_calculator;

USE macronutrients_calculator;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    age INT NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    activity_level DECIMAL(3,3) NOT NULL,
    fat_mass DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal ENUM('muscle', 'maintenance', 'loss', 'other') NOT NULL,
    other_goal VARCHAR(255),
    protein INT NOT NULL,
    carbohydrates INT NOT NULL,
    fats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);