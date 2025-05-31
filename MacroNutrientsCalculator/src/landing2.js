let mode = 'signIn';

function showForm(selected) {
    mode = selected;
    document.getElementById('signInBtn').classList.toggle('active', selected === 'signIn');
    document.getElementById('registerBtn').classList.toggle('active', selected === 'register');
    document.getElementById('message').textContent = '';
    document.getElementById('userForm').reset();
}

async function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!name || !email) {
        document.getElementById('message').textContent = 'Please fill in all fields.';
        return;
    }

    if (mode === 'signIn') {
        // Check if username and email exist and match
        try {
            const res = await fetch('http://localhost:3000/api/validate_signin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (!data.usernameExists) {
                document.getElementById('message').textContent = 'Username not found. Please register first.';
                return;
            }
            if (!data.emailExists) {
                document.getElementById('message').textContent = 'Email not found. Please register first.';
                return;
            }
            if (!data.match) {
                document.getElementById('message').textContent = 'Username and email do not match. Please try again.';
                return;
            }
            // If matched, proceed to index.html
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            window.location.href = 'index.html';
            return;
        } catch (err) {
            document.getElementById('message').textContent = 'Server error. Please try again.';
            return;
        }
    }

    if (mode === 'register') {
        // Check username and email uniqueness before registering
        try {
            const res = await fetch('http://localhost:3000/api/check_user', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (data.usernameExists) {
                document.getElementById('message').textContent = 'Username has been used, please choose another name';
                return;
            }
            if (data.emailExists) {
                document.getElementById('message').textContent = 'Email has been used, please choose another email';
                return;
            }
        } catch (err) {
            document.getElementById('message').textContent = 'Server error. Please try again.';
            return;
        }
    }

    // Proceed with sign in or registration
    fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, mode })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Store username and email in localStorage for use in index.html
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            window.location.href = 'index.html'; // Redirect on success
        } else {
            document.getElementById('message').textContent = data.message;
        }
    })
    .catch(() => {
        document.getElementById('message').textContent = 'Server error. Please try again.';
    });
}


