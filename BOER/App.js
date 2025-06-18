import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import FormScreen from './src/screens/FormScreen';
import CategoryListScreen from './src/screens/CategoryListScreen';
import CategoryFormScreen from './src/screens/CategoryFormScreen';

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { firebaseConfig, auth } from './firebase/FirebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

// Initialize the Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Firebase
  useEffect(() => {
    initializeApp(firebaseConfig);
    
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="CategoryList" component={CategoryListScreen} />
        <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}