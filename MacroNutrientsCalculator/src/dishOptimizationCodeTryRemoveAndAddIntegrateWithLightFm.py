# dish_swap_optimizer.py
import random
from typing import List, Dict, Tuple
import matplotlib.pyplot as plt
from lightfm import LightFM
from lightfm.data import Dataset
import numpy as np
import mysql.connector
from collections import defaultdict
from scipy.sparse import save_npz, load_npz
import joblib
import pickle
import mysql.connector

# -----------------------------
# Dish Data (example from user)
# -----------------------------
'''
DISHES = [
    {"id": 1, "name": "Golden Egg Fried Rice", "carbs": 117, "proteins": 211, "fats": 86},
    {"id": 2, "name": "Fragant Basil Pork", "carbs": 112, "proteins": 173, "fats": 132},
    {"id": 3, "name": "Yoyo Spicy Nuggets", "carbs": 26, "proteins": 186, "fats": 90},
    {"id": 4, "name": "Zesty Yuzu Seoul Chick Bowl", "carbs": 126, "proteins": 149, "fats": 74},
    {"id": 5, "name": "Charred Tender Chicken Cashew Bowl", "carbs": 109, "proteins": 262, "fats": 171},
    {"id": 6, "name": "Canton Pork Chop Over Cabbage-Carrot Nest", "carbs": 99, "proteins": 237, "fats": 287},
]
'''

def fetch_dishes_from_mysql(
    host: str = 'localhost',
    user: str = 'root',
    password: str = 'xiayingyu',
    database: str = 'macronutrients_calculator',
    port: int = 3306
) -> list:
    """
    Connects to a MySQL database and fetches dish data.

    Returns:
        List of dictionaries with keys: id, name, carbs, proteins, fats
    """
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
        cursor = conn.cursor()

        # Run the query
        cursor.execute("SELECT id, name, carbs, proteins, fats FROM dishes")
        rows = cursor.fetchall()

        # Transform to desired format
        dishes = [
            {"id": row[0], "name": row[1], "carbs": row[2], "proteins": row[3], "fats": row[4]}
            for row in rows
        ]

        return dishes

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()


# -----------------------------
# Constants
# -----------------------------
CAL_PER_GRAM = {"carbs": 1, "proteins": 1, "fats": 1}
MARGIN = 30  # allowable kcal deviation

# -----------------------------
# Integrate with LightFm
# -----------------------------
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
    print ("dishes: ", dishes)

# Load dishes metadata variable 
with open ('./savedLightFmData/dishesMetadata.pkl', 'rb') as f: 
    item_features_matrix = pickle.load(f)

print(dishes)


# -----------------------------
# Helper Functions
# -----------------------------
def compute_calories(dish: Dict) -> Dict:
    return {
        "carb_cal": dish["carbs"] * CAL_PER_GRAM["carbs"],
        "protein_cal": dish["proteins"] * CAL_PER_GRAM["proteins"],
        "fat_cal": dish["fats"] * CAL_PER_GRAM["fats"]
    }

def evaluate_macros(dishes: List[Dict], targets: Dict[str, int]) -> Tuple[bool, Dict[str, int]]:
    total = {"carb_cal": 0, "protein_cal": 0, "fat_cal": 0}
    for d in dishes:
        cal = compute_calories(d)
        for k in total:
            total[k] += cal[k]

    #match = all(abs(total[k] - targets[k]) <= MARGIN for k in total)
    within = all(abs(total[k] - targets[k]) <= MARGIN for k in total)
    diffCal = 0
    for k in total: 
        diffCal += abs(total[k] - targets[k])
    match = diffCal
    return match, total, within

def random_lightfm_scores(dishes: List[Dict]) -> Dict[int, float]:
    return {d["id"]: random.uniform(0, 1) for d in dishes}

def lightfm_model(userId: int) -> Dict[int, float]:
    # Map user/item string IDs to internal LightFM IDs
    user_id = loaded_dataset.mapping()[0][userId]
    dish_ids = list(range(len(dishes)))

    scores = loaded_model.predict(user_id, dish_ids, item_features=item_features_matrix)
    lightfm_scores = {index: value for index, value in enumerate(scores, start=1)}

    print ("lightfm_scores: ", lightfm_scores)
    return lightfm_scores



    return {d["id"]: random.uniform(0, 1) for d in dishes}




def optimize_selection(
    current_selection: List[Dict],
    dish_menu: List[Dict],
    targets: Dict[str, int],
    scores: Dict[int, float],
    within: bool, 
    max_changes: int = 2
) -> Tuple[List[Dict], str, List[float]]:
    best_selection = current_selection[:]
    best_action = "original"
    best_match_diffCal, totals, within = evaluate_macros(best_selection, targets)
    best_score = sum(scores[d["id"]] for d in best_selection)
    print ("original best_score is: ", best_score)
    tradeoff_scores = [best_score]
    if within: 
        return best_selection, best_action, tradeoff_scores
    
    withinFlag = False

    # 1. Try swapping
    for i in range(len(current_selection)):
        for candidate in dish_menu:
            if candidate in current_selection:
                continue
            trial = best_selection[:]
            trial[i] = candidate
            match_diffCal, _, within = evaluate_macros(trial, targets)
            score = sum(scores[d["id"]] for d in trial)
            tradeoff_scores.append(score)
            #if match and score > best_score:
            #if match_diffCal < best_match_diffCal and score > best_score: 
            if within:
                if withinFlag == False: 
                    withinFlag = True
                    best_Score = score
                    best_selection = trial[:]
                    best_action = f"swap: replaced {current_selection[i]['name']} with {candidate['name']}"
                elif withinFlag == True and score > best_score: 
                    best_Score = score
                    best_selection = trial[:]
                    best_action = f"swap: replaced {current_selection[i]['name']} with {candidate['name']}"
            elif withinFlag == False and match_diffCal < best_match_diffCal: 
            #if match_diffCal < best_match_diffCal: 
                #if score > best_score:
                best_match_diffCal = match_diffCal
                best_selection = trial[:]
                #if score > best_score: 
                best_score = score
                #best_match = True
                best_action = f"swap: replaced {current_selection[i]['name']} with {candidate['name']}"

    # 2. Try removing
    for i in range(len(current_selection)):
        trial = best_selection[:i] + best_selection[i+1:]

        match_diffCal, _, within = evaluate_macros(trial, targets)
        score = sum(scores[d["id"]] for d in trial)
        tradeoff_scores.append(score)
        #if match and score > best_score:
        if within: 
            if withinFlag == False: 
                withinFlag = True
                best_Score = score
                best_selection = trial[:]
                best_action = f"remove: removed {current_selection[i]['name']}"
            elif withinFlag == True and score > best_score: 
                best_Score = score
                best_selection = trial[:]
                best_action = f"remove: removed {current_selection[i]['name']}"
        elif withinFlag == False and match_diffCal < best_match_diffCal: 
        #if match_diffCal < best_match_diffCal: 
            #if score > best_score:
            best_match_diffCal = match_diffCal
            best_selection = trial[:]
            #if score > best_score: 
            best_score = score
            #best_match = True
            #best_action = f"swap: replaced {current_selection[i]['name']} with {candidate['name']}"
            best_action = f"remove: removed {current_selection[i]['name']}"


    # 3. Try adding
    for candidate in dish_menu:
        if candidate in current_selection:
            continue
        trial = best_selection + [candidate]
        match_diffCal, _, within = evaluate_macros(trial, targets)
        score = sum(scores[d["id"]] for d in trial)
        tradeoff_scores.append(score)
        #if match and score > best_score:
        if match_diffCal < best_match_diffCal and score > best_score: 
            best_match_diffCal = match_diffCal
            best_selection = trial[:]
            best_score = score
            best_match = True
            best_action = f"add: added {candidate['name']}"
        if within: 
            if withinFlag == False: 
                withinFlag = True
                best_Score = score
                best_selection = trial[:]
                best_action = f"add: added {candidate['name']}"
            elif withinFlag == True and score > best_score: 
                best_Score = score
                best_selection = trial[:]
                best_action = f"add: added {candidate['name']}"
        elif withinFlag == False and match_diffCal < best_match_diffCal: 
        #if match_diffCal < best_match_diffCal: 
            #if score > best_score:
            best_match_diffCal = match_diffCal
            best_selection = trial[:]
            #if score > best_score: 
            best_score = score
            #best_match = True
            #best_action = f"swap: replaced {current_selection[i]['name']} with {candidate['name']}"
            best_action = f"add: added {candidate['name']}"






    return best_selection, best_action, tradeoff_scores

# -----------------------------
# Example Usage
# -----------------------------
if __name__ == "__main__":
    # Example target macronutrient calorie goals
    target_macros = {
        "carb_cal": 100,   # example target kcal from carbs
        "protein_cal": 200,
        "fat_cal": 300
    }
    DISHES = fetch_dishes_from_mysql()
    print ("DISHES from sql: ", DISHES)
    # Simulate LightFM scores
    #lightfm_scores = random_lightfm_scores(DISHES)
    userId = 31
    lightfm_scores = lightfm_model(userId)

    # Select 3 starting dishes
    initial_selection = [DISHES[0], DISHES[1], DISHES[3]]

    print("Initial selection:")
    for d in initial_selection:
        print(f"  - {d['name']}")

    match, totals, within = evaluate_macros(initial_selection, target_macros)
    print("\nInitial Macro Totals:", totals)
    print("Match Target:", match)
    print("Initial within:", within)

    # Run optimization (swap, remove, or add)
    optimized, action_taken, tradeoffs = optimize_selection(initial_selection, DISHES, target_macros, lightfm_scores, within)

    print("\nOptimized selection:")
    for d in optimized:
        print(f"  - {d['name']}")

    match, totals, within = evaluate_macros(optimized, target_macros)
    print("\nOptimized Macro Totals:", totals)
    print("Match Target:", match)
    print("Total Preference Score:", sum(lightfm_scores[d['id']] for d in optimized))
    print("Action Taken:", action_taken)

    # Visualization
    plt.plot(tradeoffs, marker='o')
    plt.title("Tradeoff: LightFM Score During Optimization")
    plt.xlabel("Iteration")
    plt.ylabel("Total Preference Score")
    plt.grid(True)
    plt.tight_layout()
    plt.show()

