import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxRcnDYo3REAlVpHYpFVyyBg9QZYsOF9w",
    authDomain: "login-page-67088.firebaseapp.com",
    projectId: "login-page-67088",
    storageBucket: "login-page-67088.firebasestorage.app",
    messagingSenderId: "178268713114",
    appId: "1:178268713114:web:dee11f0f1a6496810e6f23"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch the recipe ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

// Function to load recipe details
const loadRecipeDetails = async () => {
  const recipeRef = doc(db, "recipes", recipeId);
  const recipeDoc = await getDoc(recipeRef);

  if (recipeDoc.exists()) {
    const recipe = recipeDoc.data();
    const recipeDetail = document.getElementById('recipeDetail');
    
    if (recipeDetail) {
      recipeDetail.innerHTML = `
  <div class="container recipe-detail-container shadow-lg p-4">
    <div class="row align-items-center">
      <div class="col-md-6">
        <h1 class="text-success fw-bold">${recipe.title}</h1>
        <p class="text-muted fs-5"><strong>👨‍🍳 Author:</strong> ${recipe.author}</p>
        <p class="text-dark fs-5"><strong>💲 Price:</strong> $${recipe.price}</p>
        <p class="fs-5"><strong>📝 Description:</strong> ${recipe.description}</p>
        
       <div class="mt-4 d-flex align-items-center gap-2"> 
    <button class="btn btn-outline-danger btn-lg favorite-btn" onclick="toggleFavorite('${recipeId}')">
        ❤️ Favorite
    </button>

    <button class="btn btn-danger btn-lg" onclick="deleteRecipe('${recipeId}')">
        🗑 Delete
    </button>

    <button class="btn btn-primary btn-lg position-relative" onclick="addToCart('${recipeId}', '${recipe.title}', '${recipe.price}', '${recipe.imageURL}')">
        🛒 Add to Cart
        <span id="cartBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill"></span>
    </button>
</div>
      </div>
      
      <div class="col-md-6 text-center">
        <img src="${recipe.imageURL}" class="recipe-img img-fluid" alt="Recipe Image">
      </div>
    </div>
  </div>
`;
    }
  }
};

// Toggle Favorite functionality
const toggleFavorite = async (recipeId) => {
  const recipeRef = doc(db, "recipes", recipeId);
  const recipeDoc = await getDoc(recipeRef);
  const currentStatus = recipeDoc.data().isFavorite;

  try {
    // Update the favorite status in Firestore
    await updateDoc(recipeRef, {
      isFavorite: !currentStatus
    });
    console.log(`Favorite status updated for recipe with ID: ${recipeId}`);

    // Update the navbar favorite count immediately
    await updateFavCount();
    
    // Optionally reload the recipe details
    loadRecipeDetails(); // You can remove this line if you don't want to reload the recipe after toggling
  } catch (e) {
    console.error("Error updating favorite status: ", e);
  }
};

// Update the favorite count in the navbar
const updateFavCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, "recipes"));
    const favCount = snapshot.docs.filter(doc => doc.data().isFavorite).length;
    
    const favCountElement = document.getElementById('favCount');
    if (favCountElement) {
      favCountElement.textContent = favCount;
    }
  } catch (e) {
    console.error("Error fetching favorite count: ", e);
  }
};

// Delete Recipe functionality
const deleteRecipe = async (recipeId) => {
  try {
    await deleteDoc(doc(db, "recipes", recipeId));
    alert("Recipe Deleted Successfully..")
    console.log(`Recipe with ID ${recipeId} deleted`);

    // Show a success message
    const recipeDetail = document.getElementById('recipeDetail');
    if (recipeDetail) {
      recipeDetail.innerHTML = '<h5>Recipe successfully deleted. You will be redirected shortly...</h5>';
    }

    // Optionally, redirect to the recipe list page after a short delay
    setTimeout(() => {
      window.location.href = './add-recipe.html'; // Or any page you want to show the updated list
    }, 2000);
  } catch (e) {
    console.error("Error deleting recipe: ", e);
  }
};


// Run the initialization logic once the page is fully loaded
window.onload = async () => {
  await updateFavCount(); // Update the favorite count
  await loadRecipeDetails(); // Load recipe details
};

// Add the functions to the global scope
window.toggleFavorite = toggleFavorite;
window.deleteRecipe = deleteRecipe;


document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent form submission for testing

      let spinner = document.getElementById("loadingSpinner");
      spinner.classList.remove("d-none"); // Show spinner
      
      setTimeout(() => {
          spinner.classList.add("d-none"); // Hide spinner after 3 seconds
      }, 3000);
  });
});


// Cart array to store selected recipes
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to add a recipe to the cart
const addToCart = (id, title, price, imageURL) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1; // Increase quantity if already in cart
    } else {
        cart.push({ id, title, price: parseFloat(price), imageURL, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI(); // Update UI
};

// Function to update the cart UI
const updateCartUI = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.classList.toggle("d-none", totalItems === 0);
    }

    const cartCount = document.getElementById("cartCount");
    const cartCountText = document.getElementById("cartCountText");
    if (cartCount) cartCount.textContent = totalItems;
    if (cartCountText) cartCountText.textContent = totalItems;

    const cartTotal = document.getElementById("cartTotal");
    if (cartTotal) cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    const cartItemsList = document.getElementById("cartItemsList");
    if (cartItemsList) {
        cartItemsList.innerHTML = ""; // Clear previous items

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <li class="list-group-item text-center text-muted" id="emptyCartMessage">
                    <i class="fas fa-shopping-basket"></i> Your cart is empty.
                </li>`;
        } else {
            cart.forEach((item, index) => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item d-flex justify-content-between align-items-center";

                listItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${item.imageURL}" class="rounded me-2" style="width: 50px; height: 50px;">
                        <div>
                            <p class="mb-0"><strong>${item.title}</strong></p>
                            <p class="mb-0 text-muted">Price: $${item.price}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-success me-1" onclick="increaseQuantity(${index})">+</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-danger me-2" onclick="decreaseQuantity(${index})">-</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;

                cartItemsList.appendChild(listItem);
            });
        }
    }
};

// Function to increase quantity
const increaseQuantity = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
};

// Function to decrease quantity
const decreaseQuantity = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1); // Remove item if quantity reaches 0
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
};

// Function to remove an item from cart
const removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
};

// Function to clear cart on checkout
const checkout = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Thank you for your purchase! Your order is being processed.");
    cart = []; // Clear the cart
    localStorage.removeItem("cart");
    updateCartUI();
};

// Load cart on page load
document.addEventListener("DOMContentLoaded", updateCartUI);

// Expose functions globally
window.addToCart = addToCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;

