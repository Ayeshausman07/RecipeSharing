import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore();

// Detect Authentication State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User Data from Firestore:", userData); // Debugging

        // Fetch user name from Firestore or Google sign-in
        const fullName = user.displayName || userData?.firstName + " " + userData?.lastName || userData?.username || "User";
        const email = user.email || "";

        
        // Set the name and email in the UI
        document.getElementById('loggedUserFName').innerText = fullName;
        document.getElementById('loggedUserEmail').innerText = userData.email || "";
        
      } else {
        console.error("No document found matching user ID in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }

  } else {
    console.log("No user is logged in. Redirecting...");
    window.location.href = "index.html"; // Redirect to login page if no user is found
  }
});

// Logout Handler
document.getElementById('logout').addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
});
