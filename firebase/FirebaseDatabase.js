// FirebaseDatabase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, remove, push } from "firebase/database";
import { firebaseConfig } from "./FirebaseAuth";

// Inicializa o Firebase Realtime Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para criar um novo registro
export const createRecord = async (path, data) => {
  try {
    const newRecordRef = push(ref(database, path));
    await set(newRecordRef, {
      ...data,
      id: newRecordRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, id: newRecordRef.key };
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    return { success: false, error: error.message };
  }
};

// Função para ler todos os registros
export const getAllRecords = async (path) => {
  try {
    const snapshot = await get(ref(database, path));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    return { success: false, error: error.message };
  }
};

// Função para ler um registro específico
export const getRecord = async (path, id) => {
  try {
    const snapshot = await get(ref(database, `${path}/${id}`));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: "Registro não encontrado" };
    }
  } catch (error) {
    console.error("Erro ao buscar registro:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar um registro
export const updateRecord = async (path, id, data) => {
  try {
    await update(ref(database, `${path}/${id}`), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir um registro
export const deleteRecord = async (path, id) => {
  try {
    await remove(ref(database, `${path}/${id}`));
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir registro:", error);
    return { success: false, error: error.message };
  }
};

export { database };