USE macronutrients_calculator;

CREATE TABLE IF NOT EXISTS dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    calories INT,
    carbs INT, 
    proteins INT, 
    fats INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dishes_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dish_name VARCHAR(256) NOT NULL UNIQUE,
    meta_value VARCHAR(255),
    FOREIGN KEY (dish_name) REFERENCES dishes(name) ON DELETE CASCADE
);

-- Insert a dish
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Golden Egg Fried Rice', 414, 117, 211, 86);
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Fragant Basil Pork', 417, 112, 173, 132);
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Yoyo Spicy Nuggets', 316, 26, 186, 90);
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Zesty Yuzu Seoul Chick Bowl', 373, 126, 149, 74);
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Charred Tender Chicken Cashew Bowl', 574, 109, 262, 171);
INSERT IGNORE INTO dishes (name, calories, carbs, proteins, fats) VALUES ('Canton Pork Chop Over Cabbage-Carrot Nest', 638, 99, 237, 287);



-- Get the dish ID (e.g., assume it’s 1)
-- Insert metadata
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Golden Egg Fried Rice', 'egg, chicken, gochujang korean sacue, fried rice, yougurt, mint'); 
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Fragant Basil Pork', 'pork, egg, basil, thai green chilli, fried rice');
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Yoyo Spicy Nuggets', 'chicken, egg, cabbage');
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Zesty Yuzu Seoul Chick Bowl', 'chicken, shirataki noodles, yuzu, pickled vegetables, gochujangi korean sauce');
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Charred Tender Chicken Cashew Bowl', 'chicken, egg, fried rice, gochujang korean sauce, cashew, protein powder');
INSERT IGNORE INTO dishes_metadata (dish_name, meta_value) VALUES ('Canton Pork Chop Over Cabbage-Carrot Nest', 'pork, egg white, cabbage, soya sauce');
