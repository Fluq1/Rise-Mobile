// FirebaseStorage.js
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { getDatabase, ref as dbRef, push, set, get, remove } from "firebase/database";
import { firebaseConfig } from "./FirebaseAuth";

// Inicializa o Firebase Storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

// Função para fazer upload de uma foto
export const uploadPhoto = async (uri, path = "photos", metadata = {}) => {
  try {
    // Converter URI para blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Gerar um nome único para o arquivo
    const filename = `${Date.now()}.jpg`;
    const photoRef = storageRef(storage, `${path}/${filename}`);
    
    // Fazer upload do arquivo
    const uploadResult = await uploadBytes(photoRef, blob, metadata);
    
    // Obter a URL de download
    const downloadURL = await getDownloadURL(photoRef);
    
    // Salvar referência no Realtime Database
    const photoData = {
      filename,
      path: `${path}/${filename}`,
      downloadURL,
      metadata: {
        ...metadata,
        contentType: 'image/jpeg',
        size: blob.size,
      },
      createdAt: new Date().toISOString(),
    };
    
    const newPhotoRef = push(dbRef(database, 'photos'));
    await set(newPhotoRef, {
      ...photoData,
      id: newPhotoRef.key,
    });
    
    return { success: true, data: { ...photoData, id: newPhotoRef.key } };
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    return { success: false, error: error.message };
  }
};

// Função para obter todas as fotos
export const getAllPhotos = async () => {
  try {
    const snapshot = await get(dbRef(database, 'photos'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const photos = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      return { success: true, data: photos };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return { success: false, error: error.message };
  }
};

// Função para obter uma foto específica
export const getPhoto = async (id) => {
  try {
    const snapshot = await get(dbRef(database, `photos/${id}`));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: "Foto não encontrada" };
    }
  } catch (error) {
    console.error("Erro ao buscar foto:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir uma foto
export const deletePhoto = async (id) => {
  try {
    // Primeiro, obter os dados da foto do Realtime Database
    const photoData = await getPhoto(id);
    
    if (!photoData.success) {
      return photoData; // Retorna o erro se a foto não for encontrada
    }
    
    // Excluir o arquivo do Storage
    const photoStorageRef = storageRef(storage, photoData.data.path);
    await deleteObject(photoStorageRef);
    
    // Excluir a referência do Realtime Database
    await remove(dbRef(database, `photos/${id}`));
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir foto:", error);
    return { success: false, error: error.message };
  }
};

export { storage };