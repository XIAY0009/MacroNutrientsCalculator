# Macronutrient Intake Calculator

## Overview
The Macronutrient Intake Calculator is a web application designed to help users calculate their macronutrient needs based on personal data such as weight, height, age, gender, activity level, and fitness goals. The application provides a user-friendly interface and utilizes a backend database to store user data and calculation results.

## Project Structure
```
MacroNutrientsCalculator
├── database
│   └── schema.sql        # SQL statements to create the database schema
├── src
│   ├── index.html        # Main HTML document for the application
│   ├── script.js         # JavaScript code for handling calculations and interactions
│   ├── styles.css        # CSS styles for the application
├── README.md             # Documentation for the project
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd MacroNutrientsCalculator
   ```

2. **Set up the database:**
   - Open your MySQL client and execute the SQL statements in `database/schema.sql` to create the necessary tables.

3. **Open the application:**
   - Open `src/index.html` in your web browser to access the Macronutrient Intake Calculator.

## Usage Guidelines
- Enter your personal information in the provided fields.
- Select your activity level and fitness goal.
- Click the "Calculate" button to see your macronutrient needs.
- Results will be displayed in the result box below the form.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.