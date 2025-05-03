function toggleLikeDish(dishName, button) {
            const userId = localStorage.getItem('userId'); // Retrieve the user's unique ID
            console.log('User ID: ', userId); 
            console.log('Dish Name: ', dishName);

            if (!userId) {
                alert('Please log in to like or unlike dishes.');
                return;
            }

            // Check if the dish is already liked
            const isLiked = button.classList.contains('liked');
            console.log('Is Liked:', isLiked); // Log whether the dish is currently liked

            // Determine the API endpoint and method based on the current state
            const endpoint = isLiked ? '/api/unlikeDish' : '/api/likeDish';
            const action = isLiked ? 'unliked' : 'liked'
            console.log('Endpoint:', endpoint); // Log the API endpoint
            console.log('Action:', action); // Log the action (like or unlike)
            
            fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dishName })
            })
            .then(response => {
                console.log('Response Status:', response.status); // Log the response status
                if (response.ok) {
                    // Toggle the button state
                    button.classList.toggle('liked');
                    button.textContent = isLiked ? 'Like' : 'Unlike';
                    alert(`You have ${action} ${dishName}!`);
                } else {
                    alert(`You have ${action} ${dishName}! Failed to update the status`);
                    //alert('You have ${action} ${dishName} Failed to update your like status. Please try again.');
                }
            })
            .catch(err => {
                console.error('Error toggling like status:', err);
                alert('An error occurred while updating your like status.');
            });
}

function addToCart(dishName, button) {
    const quantityInput = button.previousElementSibling; // Get the quantity input field
    const quantity = parseInt(quantityInput.value, 10);

    if (!quantity || quantity < 1) {
        alert('Please enter a valid quantity.');
        return;
    }

    const userId = localStorage.getItem('userId'); // Retrieve the user's unique ID
    if (!userId) {
        alert('Please log in to add items to your cart.');
        return;
    }

    fetch('http://localhost:3000/api/addToCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dishName, quantity })
    })
    .then(response => {
        if (response.ok) {
            alert(`${quantity} x ${dishName} added to your cart!`);
        } else {
            alert('Failed to add the item to your cart. Please try again.');
        }
    })
    .catch(err => {
        console.error('Error adding to cart:', err);
        alert('An error occurred while adding the item to your cart.');
    });
}

