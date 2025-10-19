function toggleOtherGoal() {
    let goal = document.getElementById('goal').value;
    let otherGoalInput = document.getElementById('other-goal');
    if (goal === 'other') {
        otherGoalInput.style.display = 'block';
    } else {
        otherGoalInput.style.display = 'none';
    }
}

function calculateMacros() {
    let weight = parseFloat(document.getElementById('weight').value);
    let height = parseFloat(document.getElementById('height').value);
    let age = parseFloat(document.getElementById('age').value);
    let gender = document.getElementById('gender').value;
    let activity = parseFloat(document.getElementById('activity').value);
    let fatMass = parseFloat(document.getElementById('fatmass').value) || 0;
    let goal = document.getElementById('goal').value;

    let BMR;
    if (fatMass === 0) {
        BMR = gender === 'male' ? (10 * weight + 6.25 * height - 5 * age + 5) : (10 * weight + 6.25 * height - 5 * age - 161);
    } else {
        let BMR1 = gender === 'male' ? (10 * weight + 6.25 * height - 5 * age + 5) : (10 * weight + 6.25 * height - 5 * age - 161);
        let BMR2 = (1 - (fatMass / 100)) * (weight * 2.20462) * 9.79 + 370;
        let BMR3 = (1 - (fatMass / 100)) * weight * 22 + 500;
        BMR = (BMR1 + BMR2 + BMR3) / 3;
    }

    let TEF = 0.1 * BMR;
    let TEA = BMR * activity;
    let TDEE = BMR + TEF + TEA;

    if (goal === 'loss') TDEE *= 0.8;

    let protein = Math.max(3 * weight, 0.54 * TDEE / 4);
    let fats = 0.2 * TDEE / 9;
    let carbs = (TDEE - (protein * 4 + fats * 9)) / 4;

    document.getElementById('results').innerHTML = 
        `<strong>Results:</strong><br>
        Total Daily Energy Expenditure: ${TDEE.toFixed(0)} cal<br>
        Protein: ${protein.toFixed(0)}g<br>
        Fats: ${fats.toFixed(0)}g<br>
        Carbs: ${carbs.toFixed(0)}g`;
}

// Save form data to the backend
function saveFormDataToBackend(data) {
    fetch('http://localhost:3000/saveFormData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log('Form data saved to backend successfully.');
        } else {
            console.error('Error saving form data to backend.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Modify the form submission handler to send data to the backend
document.getElementById('macronutrientForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        age: parseFloat(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        activity: parseFloat(document.getElementById('activity').value),
        fatMass: parseFloat(document.getElementById('fatmass').value) || 0,
        goal: document.getElementById('goal').value,
        otherGoal: document.getElementById('other-goal').value || null
    };

    // Validate required fields
    if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.activity || !formData.goal) {
        alert('Please fill in all required fields.');
        return;
    }

    saveFormDataToBackend(formData);
    calculateMacros();
});
