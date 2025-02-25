import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxRcnDYo3REAlVpHYpFVyyBg9QZYsOF9w",
    authDomain: "login-page-67088.firebaseapp.com",
    projectId: "login-page-67088",
    storageBucket: "login-page-67088.firebasestorage.app",
    messagingSenderId: "178268713114",
    appId: "1:178268713114:web:dee11f0f1a6496810e6f23"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Function to Load Favorite Recipes
const loadFavoriteRecipes = async () => {
  try {
    const favoriteQuery = query(collection(db, "recipes"), where("isFavorite", "==", true));
    const snapshot = await getDocs(favoriteQuery);
    const recipeList = document.getElementById('favoriteRecipesList');

    if (!recipeList) {
      console.error("Element #favoriteRecipesList not found!");
      return;
    }

    recipeList.innerHTML = ''; // Clear previous content

    snapshot.forEach((doc) => {
      const recipe = doc.data();
      const recipeElement = document.createElement('div');
      recipeElement.classList.add('card', 'mb-3', 'shadow-lg', 'border-0');
      recipeElement.style.backgroundColor = '#e8f5e9'; // Light Green Theme
      recipeElement.style.borderRadius = '15px';

      recipeElement.innerHTML = `
      <div class="row g-0 align-items-center">
          <div class="col-md-4">
              <img src="${recipe.imageURL}" class="img-fluid rounded-start" alt="Recipe Image"
                  style="border-top-left-radius: 15px; border-bottom-left-radius: 15px; height: 100%; object-fit: cover;">
          </div>
          <div class="col-md-8">
              <div class="card-body">
                  <h4 class="card-title text-success fw-bold" style="font-size: 1.8rem;">
                      <i class="fas fa-utensils me-2"></i> ${recipe.title}
                  </h4>
                  <p class="card-text text-dark" style="font-size: 1.2rem;">
                      ${recipe.description ? recipe.description.substring(0, 150) : "No description available"}...
                  </p>
                  <p class="card-text text-muted" style="font-size: 1.1rem;">
                      <i class="fas fa-user me-1"></i> <span class="fw-semibold">Author:</span> ${recipe.author || "Unknown"}
                  </p>
                  <p class="card-text text-muted" style="font-size: 1.1rem;">
                      <i class="fas fa-clock me-1"></i> <span class="fw-semibold">Time:</span> ${recipe.time || "30 mins"}
                  </p>
                  <p class="card-text text-muted" style="font-size: 1.1rem;">
                      <i class="fas fa-star text-warning"></i> <span class="fw-semibold">${recipe.rating || "4.5"}</span> / 5.0
                  </p>
                  <a href="recipeDetails.html?id=${doc.id}" class="btn btn-success btn-sm">📖 View</a>
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

// ✅ Toggle Favorite Function
const toggleFavorite = async (recipeId) => {
  const recipeRef = doc(db, "recipes", recipeId);
  const recipeDoc = await getDoc(recipeRef);

  if (!recipeDoc.exists()) {
    console.error(`Recipe with ID ${recipeId} not found!`);
    return;
  }

  const currentStatus = recipeDoc.data().isFavorite;

  try {
    await updateDoc(recipeRef, { isFavorite: !currentStatus });
    console.log(`Favorite status updated for recipe with ID: ${recipeId}`);

    await updateFavCount(); // ✅ Immediately update count
    await loadFavoriteRecipes(); // ✅ Reload favorites
  } catch (e) {
    console.error("Error updating favorite status: ", e);
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

// ✅ Delete Recipe Function
const deleteRecipe = async (recipeId) => {
  try {
    await deleteDoc(doc(db, "recipes", recipeId));
    alert("Recipe Deleted Successfully..");
    console.log(`Recipe with ID ${recipeId} deleted`);

    const recipeDetail = document.getElementById('recipeDetail');
    if (recipeDetail) {
      recipeDetail.innerHTML = '<h5>Recipe successfully deleted. You will be redirected shortly...</h5>';
    }

    setTimeout(() => {
      window.location.href = './add-recipe.html'; // Redirect after deletion
    }, 2000);
  } catch (e) {
    console.error("Error deleting recipe: ", e);
  }
};

// ✅ Properly Handle `window.onload`
window.onload = async () => {
  await updateFavCount();
  await loadFavoriteRecipes();
  await loadRecipeDetails();
};

// ✅ Global Scope Assignments
window.toggleFavorite = toggleFavorite;
window.deleteRecipe = deleteRecipe;
