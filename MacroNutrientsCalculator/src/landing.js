function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (name && email) {
        fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            window.location.href = 'index.html';
        })
        .catch(err => alert('Error saving user data.'));
    } else {
        alert('Please fill out both fields.');
    }
}
