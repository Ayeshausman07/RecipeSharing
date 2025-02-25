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

const style = document.createElement("style");
style.innerHTML = `@import url('style3.css');`;
document.head.appendChild(style);


// Show the form for editing an existing recipe
let editingRecipeId = null;  // Track the currently editing recipe ID

// Function to handle image upload directly
const uploadImageToCloudinary = async (file) => {
    const cloudName = 'doaeeevvi'; // Your Cloudinary cloud name
    const uploadPreset = 'recipe_app'; // Your Cloudinary upload preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url; // Return uploaded image URL
        } else {
            console.error('Image upload failed:', data);
            return null;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

// Recipe Submit Function
const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;
    const price = document.getElementById('price').value;
    const imageInput = document.getElementById('image');

    let imageURL = null;

    // Upload image if a file is selected
    if (imageInput.files && imageInput.files[0]) {
        imageURL = await uploadImageToCloudinary(imageInput.files[0]);
    }

    // If editing an existing recipe
    if (editingRecipeId) {
        try {
            const updateData = { title, description, author, price };
            if (imageURL) {
                updateData.imageURL = imageURL; // Update image only if new image is uploaded
            }
            await updateDoc(doc(db, "recipes", editingRecipeId), updateData);
            alert("Recipe Updated Successfully!");
            loadRecipes();
            resetForm();
        } catch (e) {
            console.error("Error updating recipe: ", e);
        }
    } else {
        // Add new recipe
        try {
            const newRecipe = { title, description, author, price, imageURL, isFavorite: false };
            await addDoc(collection(db, "recipes"), newRecipe);
            alert("Recipe Added Successfully!");
            loadRecipes();
            resetForm();
        } catch (e) {
            console.error("Error adding recipe: ", e);
        }
    }
};

// Function to reset the form
const resetForm = () => {
    document.getElementById('recipeForm').reset();
    document.getElementById('submitBtn').textContent = 'Add Recipe'; // Reset to Add Recipe
    editingRecipeId = null;
};

// Load Recipes from Firestore
const loadRecipes = async () => {
    try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const recipeList = document.getElementById('recipeList');
        recipeList.innerHTML = ''; // Clear previous recipes

        snapshot.forEach((doc) => {
            const recipe = doc.data();
            const recipeElement = document.createElement('div');
            recipeElement.classList.add('col-md-4', 'col-sm-6', 'mb-4'); // Responsive grid
            
            recipeElement.innerHTML = `
                <div class="card recipe-card border-0 shadow-sm text-center">
                    <img src="${recipe.imageURL}" class="img-fluid recipe-img mx-auto mt-3" alt="Recipe Image">
                    <div class="card-body">
                        <h5 class="card-title text-success fw-bold">${recipe.title}</h5>
                        <p class="card-text text-muted small">${recipe.description.substring(0, 100)}...</p>
                        <p class="text-muted small"><strong>👨‍🍳 ${recipe.author}</strong></p>
                        <div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-outline-success btn-sm" onclick="editRecipe('${doc.id}')">✏️ Edit</button>
                            <a href="recipeDetails.html?id=${doc.id}" class="btn btn-success btn-sm">📖 View</a>
                        </div>
                    </div>
                </div>
            `;
            
            // Append recipes inside a Bootstrap row
            document.getElementById("recipeList").classList.add("row"); // Ensure the parent has a row class
            document.getElementById("recipeList").appendChild(recipeElement);
            
        
            recipeList.appendChild(recipeElement);
        });
    } catch (e) {
        console.error("Error getting recipes: ", e);
    }
};

// Edit Recipe functionality
const editRecipe = async (recipeId) => {
    editingRecipeId = recipeId;
    try {
        const recipeRef = doc(db, "recipes", recipeId);
        const recipeDoc = await getDoc(recipeRef);

        if (recipeDoc.exists()) {
            const recipe = recipeDoc.data();
            document.getElementById('title').value = recipe.title;
            document.getElementById('description').value = recipe.description;
            document.getElementById('author').value = recipe.author;
            document.getElementById('price').value = recipe.price;
            document.getElementById('submitBtn').textContent = 'Update Recipe';
        }
    } catch (e) {
        console.error("Error getting recipe document: ", e);
    }
};

// Delete Recipe functionality
const deleteRecipe = async (recipeId) => {
    try {
        await deleteDoc(doc(db, "recipes", recipeId));
        console.log(`Recipe with ID ${recipeId} deleted`);
        loadRecipes();
    } catch (e) {
        console.error("Error deleting recipe: ", e);
    }
};

// ✅ Update Favorite Count in Navbar
const updateFavCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, "recipes"));
    const favCount = snapshot.docs.filter(doc => doc.data().isFavorite).length;

    console.log("Updated Favorite Count:", favCount); // Debugging
    const favCountElement = document.getElementById('favCount');

    if (favCountElement) {
      favCountElement.textContent = favCount;
    } else {
      console.error("Element #favCount not found!");
    }
  } catch (e) {
    console.error("Error fetching favorite count: ", e);
  }
};

// Add event listener to the form
document.getElementById('recipeForm').addEventListener('submit', handleRecipeSubmit);

// Load recipes when the page loads
window.onload = loadRecipes;

// Add functions to global scope
window.editRecipe = editRecipe;
window.deleteRecipe = deleteRecipe;



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

