document.getElementById('macronutrientForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get user inputs
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = parseInt(document.getElementById('activity').value);
    const fatMass = parseFloat(document.getElementById('fatmass').value);
    const goal = document.getElementById('goal').value;

    // Validate required fields
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        alert('Please fill out all required fields.');
        return; // Stop execution if validation fails
    }

    // Step 1: Calculate BMR
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Step 2: Adjust BMR based on fat mass percentage if available
    if (fatMass > 0) {
        const weightLbs = weight * 2.20462;
        const bmrFatMass2 = (1 - fatMass / 100) * weightLbs * 9.79 + 370;
        const bmrFatMass3 = (1 - fatMass / 100) * weight * 22 + 500;
        bmr = (bmr + bmrFatMass2 + bmrFatMass3) / 3;
    }

    // Step 3: Calculate TEF (Thermic Effect of Food) = 10% of BMR
    const tef = 0.1 * bmr;

    // Step 4: Calculate TEA (Thermic Effect of Activity) using Activity Multiplier
    const activityMultipliers = [0.2, 0.375, 0.55, 0.725, 0.9];
    const tea = bmr * activityMultipliers[activityLevel - 1];

    // Step 5: Calculate TDEE
    const tdee = bmr + tef + tea;

    // Step 6: Adjusted TDEE for weight loss (80% of TDEE)
    const adjustedTdee = goal === 'weight-loss' ? 0.8 * tdee : tdee;

    // Step 7: Macronutrient Calculation
    const proteinGrams = Math.max(3 * weight, 0.54 * adjustedTdee / 4);  // Protein in grams
    const fatsGrams = (0.2 * adjustedTdee) / 9;  // Fats in grams
    const carbsGrams = (adjustedTdee - (proteinGrams * 4 + fatsGrams * 9)) / 4;  // Carbs in grams

    // Display results
    //document.getElementById('protein').textContent = proteinGrams.toFixed(2);
    //document.getElementById('fats').textContent = fatsGrams.toFixed(2);
    //document.getElementById('carbs').textContent = carbsGrams.toFixed(2);

    //document.getElementById('results').style.display = 'block';

    displayResults();
});
