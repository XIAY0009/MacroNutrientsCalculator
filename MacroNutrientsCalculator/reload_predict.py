from lightfm import LightFM
from lightfm.data import Dataset
import numpy as np
import mysql.connector
from collections import defaultdict
from scipy.sparse import save_npz, load_npz
import joblib
import pickle


### STEP 3: Later... Load and Predict ###
# Load dataset
with open('./savedLightFmData/dataset.pkl', 'rb') as f:
    loaded_dataset = pickle.load(f)

# Load interaction matrix
loaded_interactions = load_npz('./savedLightFmData/interactions.npz')

# Load model
loaded_model = joblib.load('./savedLightFmData/lightfm_model.pkl')

# Load dishes variable 
with open('./savedLightFmData/dishes.pkl', 'rb') as f:
    dishes = pickle.load(f)

# Load dishes metadata variable 
with open ('./savedLightFmData/dishesMetadata.pkl', 'rb') as f: 
    item_features_matrix = pickle.load(f)

print(dishes)

### STEP 4: Predict score ###
# Map user/item string IDs to internal LightFM IDs
user_id = loaded_dataset.mapping()[0][31]
dish_ids = list(range(len(dishes)))

scores = loaded_model.predict(user_id, dish_ids, item_features=item_features_matrix)
top_items = np.argsort(-scores)

# Print recommendations
print("Top dish recommendations for selected user:")
for index in top_items:
    print(f"- {dishes[index]} (score: {scores[index]:.2f})")





#user_index = loaded_dataset.mapping()[0][user_id]
#item_index = loaded_dataset.mapping()[2][item_id]

# Predict preference score
#score = loaded_model.predict(user_ids=user_index, item_ids=item_index)
#print(f"Predicted score for user '{user_id}' and item '{item_id}': {score:.4f}")
