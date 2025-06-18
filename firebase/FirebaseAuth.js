// FirebaseAuth.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyCatkOxWp7Qwi9jeRykQlJPFvgYyud4VQE",
  authDomain: "teste-8a705.firebaseapp.com",
  projectId: "teste-8a705",
  storageBucket: "teste-8a705.firebasestorage.app",
  messagingSenderId: "567241467490",
  appId: "1:567241467490:web:9d56c40506f59d6040933b",
  databaseURL: "https://teste-8a705-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const database = getDatabase(app);

// Sign up with email and password
export const registerWithEmailAndPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Log in with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Password reset
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Log out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

export { auth };

// Configurar Google Sign-In
GoogleSignin.configure({
  webClientId: '567241467490-v4eihmehpk6bfcjkgdeh9r72i2peelp1.apps.googleusercontent.com', // Substitua pelo seu Web Client ID do Firebase
});

// Login com Google
export const signInWithGoogle = async () => {
  try {
    // Fazer login com Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Criar credencial para o Firebase
    const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
    
    // Fazer login no Firebase com a credencial do Google
    const userCredential = await signInWithCredential(auth, googleCredential);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};