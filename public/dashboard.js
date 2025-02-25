import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyBxRcnDYo3REAlVpHYpFVyyBg9QZYsOF9w",
authDomain: "login-page-67088.firebaseapp.com",
projectId: "login-page-67088",
storageBucket: "login-page-67088.firebasestorage.app",
messagingSenderId: "178268713114",
appId: "1:178268713114:web:dee11f0f1a6496810e6f23"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fetchUsers() {
    const usersTableBody = document.getElementById("usersTableBody");
    usersTableBody.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((docSnapshot) => {
        const user = docSnapshot.data();
        usersTableBody.innerHTML += `
            <tr>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editUser('${docSnapshot.id}', '${user.firstName}', '${user.lastName}', '${user.email}', '${user.status}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${docSnapshot.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

window.editUser = async (userId, firstName, lastName, email, status) => {
    const newFirstName = prompt("Enter new first name:", firstName);
    const newLastName = prompt("Enter new last name:", lastName);
    const newStatus = prompt("Enter new status:", status);
    if (newFirstName && newLastName && newStatus) {
        try {
            await updateDoc(doc(db, "users", userId), {
                firstName: newFirstName,
                lastName: newLastName,
                status: newStatus
            });
            alert("User updated successfully");
            fetchUsers();
        } catch (error) {
            alert("Error updating user: " + error.message);
        }
    }
};

window.deleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await deleteDoc(doc(db, "users", userId));
            alert("User deleted successfully");
            fetchUsers();
        } catch (error) {
            alert("Error deleting user: " + error.message);
        }
    }
};

window.logout = async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Error logging out: " + error.message);
    }
};

document.addEventListener("DOMContentLoaded", fetchUsers);


// ADD RECIPES

// Expose functions to global scope (window)
window.editRecipe = async function (recipeId, title, description, author, price, imageURL) {
    const newTitle = prompt("Enter new title:", title);
    const newDescription = prompt("Enter new description:", description);
    const newPrice = prompt("Enter new price:", price);

    if (newTitle && newDescription && newPrice) {
        try {
            const recipeRef = doc(db, "recipes", recipeId);
            await updateDoc(recipeRef, {
                title: newTitle,
                description: newDescription,
                price: newPrice
            });
            alert("Recipe updated successfully");
            fetchRecipes();
        } catch (error) {
            alert("Error updating recipe: " + error.message);
        }
    }
}

window.deleteRecipe = async function (recipeId) {
    if (confirm("Are you sure you want to delete this recipe?")) {
        try {
            const recipeRef = doc(db, "recipes", recipeId);
            await deleteDoc(recipeRef);
            alert("Recipe deleted successfully");
            fetchRecipes();
        } catch (error) {
            alert("Error deleting recipe: " + error.message);
        }
    }
}

window.logout = function () {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Error logging out: " + error.message);
    });
}

// Fetch recipes from Firestore
async function fetchRecipes() {
    const recipeTableBody = document.getElementById("recipeTableBody");
    recipeTableBody.innerHTML = ""; // Clear existing data

    try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        querySnapshot.forEach((doc) => {
            const recipe = doc.data();

            // Fix description issue (ensure it's text)
            let descriptionText = recipe.description;
            if (descriptionText.includes("http")) {
                descriptionText = "No description available";
            }

            // Fix price issue (ensure it's numeric)
            let priceText = recipe.price;
            if (!priceText || priceText.toLowerCase() === "ayesha") {
                priceText = "Not available";
            }

            recipeTableBody.innerHTML += `
                <tr>
                    <td>${recipe.title}</td>
                    <td><img src="${recipe.imageURL}" width="50" height="50" class="rounded"></td>
                    <td>${descriptionText}</td>
                    <td>${recipe.author}</td>
                    <td>${priceText}</td>
                    <td>
                        <button class="btn btn-edit btn-sm" onclick="editRecipe('${doc.id}', '${recipe.title}', '${descriptionText}', '${recipe.author}', '${priceText}', '${recipe.imageURL}')">Edit</button>
                        <button class="btn btn-delete btn-sm" onclick="deleteRecipe('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        alert("Error fetching recipes: " + error.message);
    }
}

// Call fetchRecipes when the DOM content is loaded
document.addEventListener("DOMContentLoaded", fetchRecipes);

// Function to load favorite recipes
const loadFavoriteRecipes = async () => {
    try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const favoriteRecipes = snapshot.docs.filter(doc => doc.data().isFavorite);

        const recipeList = document.getElementById("favoriteRecipesList");
        recipeList.innerHTML = ""; // Clear any existing recipes

        if (favoriteRecipes.length === 0) {
            recipeList.innerHTML = `<p class="text-muted">No favorite recipes found.</p>`;
            return;
        }

        favoriteRecipes.forEach((doc) => {
            const recipe = doc.data();

            // Fix description issue (ensure it's text)
            let descriptionText = recipe.description;
            if (descriptionText.includes("http")) {
                descriptionText = "No description available";
            }

            // Fix price issue (ensure it's numeric)
            let priceText = recipe.price;
            if (!priceText || priceText.toLowerCase() === "ayesha") {
                priceText = "Not available";
            }

            const recipeElement = document.createElement("div");
            recipeElement.classList.add("col-md-6");
            recipeElement.innerHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${recipe.imageURL}" class="img-fluid rounded-start" alt="Recipe Image">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${recipe.title}</h5>
                                <p class="card-text">${descriptionText.substring(0, 100)}...</p>
                                <p class="card-text"><small class="text-muted">Price: ${priceText}</small></p>
                                <p class="card-text"><small class="text-muted">Author: ${recipe.author}</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            recipeList.appendChild(recipeElement);
        });
    } catch (e) {
        console.error("Error getting favorite recipes: ", e);
    }
};

// Load favorite recipes on page load
document.addEventListener("DOMContentLoaded", loadFavoriteRecipes);
