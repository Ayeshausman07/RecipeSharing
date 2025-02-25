import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc,collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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


// Utility function to show messages
function showMessage(message, divId, isSuccess = false) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.className = isSuccess ? "alert alert-primary" : "alert alert-danger"; // Blue for success, Red for failure
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}
// Fetch user data from Firestore
async function fetchUserData(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      console.log("User Data:", userDoc.data());  // Debugging log
      return userDoc.data();
    } else {
      console.error("User data not found in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Detect Authentication State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    const userData = await fetchUserData(user.uid);
    if (userData) {
      document.getElementById("userInfo").innerText = `Welcome, ${userData.firstName} ${userData.lastName}`;
    } else {
      document.getElementById("userInfo").innerText = "User data not found";
    }
  } else {
    console.log("No user logged in");
  }
});

// Signup handler


document.getElementById("submitSignUp").addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("rEmail").value.trim();
  const password = document.getElementById("rPassword").value.trim();
  const firstName = document.getElementById("fName").value.trim();
  const lastName = document.getElementById("lName").value.trim();

  if (!email || !password || !firstName || !lastName) {
    showMessage("All fields are required.", "signUpMessage");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { email, firstName, lastName });
    showMessage("Account Created Successfully", "signUpMessage",true);
    window.location.href = "homepage.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      showMessage("Email Address Already Exists !!!", "signUpMessage");
    } else {
      showMessage("Unable to create User", "signUpMessage");
    }
  }
});




//sign handler

document.getElementById("submitSignIn").addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMessage("Email and Password are required.", "signInMessage");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Wait for Firestore data to load
    const userData = await fetchUserData(user.uid);

    if (userData) {
      showMessage("Login successful", "signInMessage", true);

      // Default profile picture if none exists
      const defaultProfilePic = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
      const profilePic = userData.profilePic || defaultProfilePic;
      
      // Construct full name
      const fullName = `${userData.firstName} ${userData.lastName}`;

      console.log("User email:", userData.email);
      console.log("Full Name:", fullName);
      console.log("Profile Picture:", profilePic);

      // Store data in localStorage (Optional: For Profile Page)
      localStorage.setItem("userFullName", fullName);
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userProfilePic", profilePic);

      // Check if user is the admin
      if (
        userData.firstName.toLowerCase() === "ayesha" &&
        userData.lastName.toLowerCase() === "usman" &&
        userData.email === "uayesha8322@gmail.com"
      ) {
        console.log("Redirecting to Dashboard...");
        window.location.href = "dashboard.html"; 
      } else {
        console.log("Redirecting to Homepage...");
        window.location.href = "homepage.html";
      }
    } else {
      showMessage("User data not found. Please contact support.", "signInMessage");
    }
  } catch (error) {
    console.error("Login error:", error);

    if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
      showMessage("Incorrect Email or Password", "signInMessage");
    } else {
      showMessage("Failed to log in. Please try again.", "signInMessage");
    }
  }
});




// forget password handler (sendPasswordResetEmail)
const forgetPasswordButton=document.getElementById('forgetpassword');
forgetPasswordButton.addEventListener('click',function(event){
event.preventDefault();
const email = document.getElementById("email").value;
sendPasswordResetEmail(auth, email)
  .then(() => {
    // Password reset email sent!
    // ..
    alert("Password reset email sent!");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
    alert("Error sending password reset email:",errorMessage);
  });
})


// Google Auth Provider
document.getElementById("googleLoginButton").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Default profile picture if none is provided
    const defaultProfilePic = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      profilePic: user.photoURL || defaultProfilePic  // Fix applied here
    }, { merge: true });

    alert("Google login successful!");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Error with Google Login:", error);
  }
});
