
# Install LightFM if not already installed
# You can uncomment the next line if running in a fresh environment
# !pip install lightfm

from lightfm import LightFM
from lightfm.data import Dataset
import numpy as np
import mysql.connector
from collections import defaultdict

weightCart = 1
weightLike = 0.5

# MySQL connection details
db_config = {
    'host': 'localhost',       # Replace with your database host
    'user': 'root',   # Replace with your database username
    'password': 'xiayingyu', # Replace with your database password
    'database': 'macronutrients_calculator'  # Replace with your database name
}

try:
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    cursor.execute("SELECT user_id, dish_name FROM likes")
    addedToLikes = cursor.fetchall()  # Fetch all rows
   
    cursor.execute("SELECT id FROM users")
    users_data = cursor.fetchall()  # Fetch all rows
    users = [user[0] for user in users_data]  # Extract user IDs from the tuples

    cursor.execute("SELECT user_id, dish_name, quantity FROM cart")
    addedToCart = cursor.fetchall()  # Fetch all rows

    cursor.execute("SELECT dish_name, meta_value FROM dishes_metadata")
    dishes_name_dishes_metadata = cursor.fetchall()  # Fetch all rows
    # 1. Create the dishes list (using the names from the tuples)
    dishes = [name for name, _ in dishes_name_dishes_metadata]
    # 2. Create the dish_features dictionary
    dish_features = {
        name: [feature.strip() for feature in features.split(',')]
        for name, features in dishes_name_dishes_metadata
    }

    # Close the cursor and connection
    cursor.close()
    connection.close()

except mysql.connector.Error as err:
    print(f"Error: {err}")

# Initialize a dictionary to store weighted interactions
weighted_interactions = defaultdict(float)

# Process addToCart interactions
for user, dish, weight in addedToCart:
    weighted_interactions[(user, dish)] += weightCart*weight

# Process likeDish interactions
for user, dish in addedToLikes:
    weighted_interactions[(user, dish)] += weightLike

# Convert the dictionary to a list of tuples (user, dish, weighted_interaction_count)
interactions = [(user, dish, weight) for (user, dish), weight in weighted_interactions.items()]

# Step 1: Initialize dataset
dataset = Dataset()

# Fit users and dishes
dataset.fit(users, dishes)

# Extract all unique features
all_features = set(f for features in dish_features.values() for f in features)

# Fit dish features
dataset.fit_partial(items=dishes, item_features=all_features)

# Step 2: Build interaction matrix
(interaction_matrix, _) = dataset.build_interactions(interactions)

# Step 3: Build item feature matrix
item_features_matrix = dataset.build_item_features(
    ((dish, feats) for dish, feats in dish_features.items())
)

# Step 4: Build and train the model
model = LightFM(loss='warp')
model.fit(interaction_matrix, item_features=item_features_matrix, epochs=10, num_threads=2)

# Step 5: Make predictions for a user id 9
user_id = dataset.mapping()[0][9]
dish_ids = list(range(len(dishes)))

scores = model.predict(user_id, dish_ids, item_features=item_features_matrix)
top_items = np.argsort(-scores)

# Print recommendations
print("Top dish recommendations for selected user:")
for index in top_items:
    print(f"- {dishes[index]} (score: {scores[index]:.2f})")


# Step 5: Make predictions for a user id 11
user_id = dataset.mapping()[0][1]
dish_ids = list(range(len(dishes)))

scores = model.predict(user_id, dish_ids, item_features=item_features_matrix)
top_items = np.argsort(-scores)

# Print recommendations
print("Top dish recommendations for selected user:")
for index in top_items:
    print(f"- {dishes[index]} (score: {scores[index]:.2f})")
