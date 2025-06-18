// FirebaseCategories.js
import { getDatabase, ref, set, get, update, remove, push, onValue, off } from "firebase/database";
import { Alert } from 'react-native';

// Get the database instance
const database = getDatabase();

// Function to create a new category
export const createCategory = async (data) => {
  try {
    const newCategoryRef = push(ref(database, 'categories'));
    await set(newCategoryRef, {
      ...data,
      id: newCategoryRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, id: newCategoryRef.key };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
};

// Function to get all categories
export const getAllCategories = async () => {
  try {
    const snapshot = await get(ref(database, 'categories'));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
};

// Function to get a specific category
export const getCategory = async (id) => {
  try {
    const snapshot = await get(ref(database, `categories/${id}`));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: "Category not found" };
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: error.message };
  }
};

// Function to update a category
export const updateCategory = async (id, data) => {
  try {
    await update(ref(database, `categories/${id}`), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
};

// Function to delete a category
export const deleteCategory = async (id) => {
  try {
    // Make sure the category exists before deleting
    const categoryRef = ref(database, `categories/${id}`);
    const snapshot = await get(categoryRef);
    
    if (!snapshot.exists()) {
      return { success: false, error: "Category not found" };
    }
    
    // Delete the category
    await remove(categoryRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
};

// Function to observe categories in real-time
export const observeCategories = (callback) => {
  const categoriesRef = ref(database, 'categories');
  
  // Set up the listener and store the unsubscribe function
  const unsubscribe = onValue(categoriesRef, (snapshot) => {
    const data = snapshot.val();
    const categoriesList = [];
    
    if (data) {
      Object.keys(data).forEach(key => {
        categoriesList.push({
          id: key,
          ...data[key]
        });
      });
    }
    
    callback(categoriesList);
  }, (error) => {
    console.error("Error observing categories:", error);
    Alert.alert("Error", "Failed to load categories. Please try again.");
  });
  
  // Return the unsubscribe function directly
  return () => {
    console.log("Unsubscribing from categories observer");
    unsubscribe();
  };
};