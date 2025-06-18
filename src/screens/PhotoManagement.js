import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../constants/theme';
import { CustomButton } from '../components/CustomComponents';

const { width } = Dimensions.get('window');

// Configurações das APIs
const MOCKAPI_BASE_URL = 'https://6837918f2c55e01d184a36fa.mockapi.io/photos/photos';
const IMGBB_API_KEY = '79ab9dd607561098248f45353394389b';
const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

const PhotoManagement = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false); // New state
  const [editMode, setEditMode] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    selectedImage: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
    requestPermissions();
  }, []);

  // Solicitar permissões para acessar a galeria
  const requestPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        // Solicitar permissão para galeria
        const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media library permission:', mediaLibraryStatus);
        
        // Solicitar permissão para câmera
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission:', cameraStatus);
        
        if (mediaLibraryStatus.status !== 'granted') {
          console.log('Permissão da galeria não concedida');
        }
        
        if (cameraStatus.status !== 'granted') {
          console.log('Permissão da câmera não concedida');
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
    }
  };

  // Carregar fotos da API
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(MOCKAPI_BASE_URL);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      Alert.alert('Erro', 'Não foi possível carregar as fotos.');
    } finally {
      setLoading(false);
    }
  };

  // Upload da imagem para o ImgBB - versão compatível com Web
  const uploadImageToImgBB = async (imageUri) => {
    try {
      let formData = new FormData();
      
      if (Platform.OS === 'web') {
        // Para Web: converter base64 para blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'photo.jpg');
      } else {
        // Para Mobile: usar URI diretamente
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }

      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error('Falha no upload da imagem');
      }
    } catch (error) {
      console.error('Erro no upload para ImgBB:', error);
      throw error;
    }
  };

  // Selecionar imagem da galeria
  const pickImageFromGallery = async () => {
    try {
      console.log('Starting gallery picker');
      setImagePickerModalVisible(false); // Close the picker modal first
      
      if (Platform.OS === 'web') {
        // Para Web: usar input HTML
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log('Image loaded from gallery');
              setFormData({
                ...formData,
                selectedImage: e.target.result,
                url: '' // Limpar URL manual quando selecionar imagem
              });
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      } else {
        // Para Mobile: usar ImagePicker
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permissão Negada', 'Você precisa permitir o acesso à galeria para selecionar imagens.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: false,
        });

        console.log('Gallery picker result:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setFormData({
            ...formData,
            selectedImage: result.assets[0].uri,
            url: '' // Limpar URL manual quando selecionar imagem
          });
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', `Não foi possível selecionar a imagem: ${error.message}`);
    }
  };

  // Tirar foto com câmera
  const takePhoto = async () => {
    try {
      console.log('Starting camera');
      setImagePickerModalVisible(false); // Close the picker modal first
      
      if (Platform.OS === 'web') {
        // Para Web: usar câmera HTML5
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera';
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log('Photo taken with camera');
              setFormData({
                ...formData,
                selectedImage: e.target.result,
                url: '' // Limpar URL manual quando tirar foto
              });
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      } else {
        // Para Mobile: usar ImagePicker
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        
        if (cameraPermission.granted === false) {
          Alert.alert('Permissão Negada', 'Você precisa permitir o acesso à câmera para tirar fotos.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: false,
        });

        console.log('Camera result:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setFormData({
            ...formData,
            selectedImage: result.assets[0].uri,
            url: '' // Limpar URL manual quando tirar foto
          });
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', `Não foi possível tirar a foto: ${error.message}`);
    }
  };

  // Mostrar modal de opções de imagem
  const showImagePickerOptions = () => {
    console.log('Opening image picker modal');
    setImagePickerModalVisible(true);
  };

  // Salvar foto (criar ou editar)
  const savePhoto = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para a foto.');
      return;
    }

    if (!formData.selectedImage && !formData.url.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem ou insira uma URL.');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.url;

      // Se uma imagem foi selecionada, fazer upload para ImgBB
      if (formData.selectedImage) {
        imageUrl = await uploadImageToImgBB(formData.selectedImage);
      }

      const photoData = {
        title: formData.title.trim(),
        url: imageUrl
      };

      let response;
      if (editMode) {
        // Editar foto existente
        response = await fetch(`${MOCKAPI_BASE_URL}/${currentPhoto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(photoData),
        });
      } else {
        // Criar nova foto
        response = await fetch(MOCKAPI_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(photoData),
        });
      }

      if (response.ok) {
        Alert.alert('Sucesso', `Foto ${editMode ? 'editada' : 'adicionada'} com sucesso!`);
        closeModal();
        loadPhotos();
      } else {
        throw new Error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Deletar foto
  const deletePhoto = (photo) => {
    console.log('Delete photo called for:', photo); // Debug log
    
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${photo.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting delete request for photo ID:', photo.id); // Debug log
              console.log('Delete URL:', `${MOCKAPI_BASE_URL}/${photo.id}`); // Debug log
              
              const response = await fetch(`${MOCKAPI_BASE_URL}/${photo.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
  
              console.log('Delete response status:', response.status); // Debug log
              console.log('Delete response ok:', response.ok); // Debug log
  
              if (response.ok) {
                console.log('Photo deleted successfully'); // Debug log
                Alert.alert('Sucesso', 'Foto excluída com sucesso!');
                await loadPhotos(); // Await the reload
              } else {
                // Try to get error details from response
                const errorText = await response.text();
                console.error('Delete failed with status:', response.status, 'Error:', errorText);
                throw new Error(`Falha na exclusão. Status: ${response.status}`);
              }
            } catch (error) {
              console.error('Erro ao deletar foto:', error);
              Alert.alert('Erro', `Não foi possível excluir a foto: ${error.message}`);
            }
          }
        }
      ]
    );
  };
  

  // Abrir modal para adicionar nova foto
  const openAddModal = () => {
    setEditMode(false);
    setCurrentPhoto(null);
    setFormData({
      title: '',
      url: '',
      selectedImage: null
    });
    setModalVisible(true);
  };

  // Abrir modal para editar foto
  const openEditModal = (photo) => {
    setEditMode(true);
    setCurrentPhoto(photo);
    setFormData({
      title: photo.title,
      url: photo.url,
      selectedImage: null
    });
    setModalVisible(true);
  };

  // Fechar modal
  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      title: '',
      url: '',
      selectedImage: null
    });
    setEditMode(false);
    setCurrentPhoto(null);
  };

  // Renderizar item da lista de fotos
  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.url }} style={styles.photoImage} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.photoDate}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.photoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Feather name="edit-2" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deletePhoto(item)}
        >
          <Feather name="trash-2" size={16} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Fotos</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Feather name="plus" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Lista de Fotos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPhotoItem}
          contentContainerStyle={styles.photosList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPhotos}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="image" size={48} color={COLORS.GRAY} />
              <Text style={styles.emptyText}>Nenhuma foto encontrada</Text>
              <Text style={styles.emptySubtext}>Toque no + para adicionar uma foto</Text>
            </View>
          }
        />
      )}

      {/* Modal de Seleção de Imagem */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imagePickerModalVisible}
        onRequestClose={() => setImagePickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModal}>
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerTitle}>Selecionar Imagem</Text>
              <TouchableOpacity onPress={() => setImagePickerModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={pickImageFromGallery}
                activeOpacity={0.7}
              >
                <View style={styles.imagePickerOptionIcon}>
                  <Feather name="image" size={24} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.imagePickerOptionContent}>
                  <Text style={styles.imagePickerOptionText}>
                    {Platform.OS === 'web' ? 'Selecionar Arquivo' : 'Galeria'}
                  </Text>
                  <Text style={styles.imagePickerOptionSubtext}>
                    {Platform.OS === 'web' ? 'Escolher um arquivo do seu dispositivo' : 'Escolher da galeria de fotos'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={takePhoto}
                activeOpacity={0.7}
              >
                <View style={styles.imagePickerOptionIcon}>
                  <Feather name="camera" size={24} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.imagePickerOptionContent}>
                  <Text style={styles.imagePickerOptionText}>
                    {Platform.OS === 'web' ? 'Usar Câmera' : 'Câmera'}
                  </Text>
                  <Text style={styles.imagePickerOptionSubtext}>
                    {Platform.OS === 'web' ? 'Tirar uma foto com a câmera' : 'Tirar uma nova foto'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Adicionar/Editar Foto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Foto' : 'Nova Foto'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Título */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Digite o título da foto"
                  placeholderTextColor={COLORS.GRAY}
                />
              </View>

              {/* Seleção de Imagem */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Imagem *</Text>
                
                {/* Preview da imagem */}
                {(formData.selectedImage || formData.url) && (
                  <View style={styles.imagePreview}>
                    <Image 
                      source={{ uri: formData.selectedImage || formData.url }} 
                      style={styles.previewImage}
                    />
                  </View>
                )}

                {/* Botões de seleção */}
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={showImagePickerOptions}
                  activeOpacity={0.7}
                >
                  <Feather name="camera" size={20} color={COLORS.PRIMARY} />
                  <Text style={styles.imageButtonText}>Selecionar da Galeria/Câmera</Text>
                </TouchableOpacity>

                {/* Separador */}
                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OU</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* URL da imagem */}
                <TextInput
                  style={styles.textInput}
                  value={formData.url}
                  onChangeText={(text) => setFormData({ ...formData, url: text, selectedImage: null })}
                  placeholder="Cole a URL da imagem"
                  placeholderTextColor={COLORS.GRAY}
                  keyboardType="url"
                />
              </View>
            </ScrollView>

            {/* Botões do Modal */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={savePhoto}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editMode ? 'Salvar' : 'Adicionar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY,
  },
  photosList: {
    padding: SPACING.medium,
  },
  photoItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  photoInfo: {
    flex: 1,
    marginLeft: SPACING.medium,
  },
  photoTitle: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  photoDate: {
    fontSize: FONTS.SIZES.small,
    color: COLORS.GRAY,
  },
  photoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.SIZES.large,
    color: COLORS.GRAY,
    marginTop: SPACING.medium,
    fontWeight: FONTS.WEIGHTS.medium,
  },
  emptySubtext: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY,
    marginTop: SPACING.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // Image Picker Modal Styles
  imagePickerModal: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  imagePickerTitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  imagePickerOptions: {
    padding: SPACING.large,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  imagePickerOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.PRIMARY}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  imagePickerOptionContent: {
    flex: 1,
  },
  imagePickerOptionText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  imagePickerOptionSubtext: {
    fontSize: FONTS.SIZES.small,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  // Main Modal Styles
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  modalTitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.large,
  },
  inputGroup: {
    marginBottom: SPACING.large,
  },
  inputLabel: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.BLACK,
    marginBottom: SPACING.small,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: FONTS.SIZES.medium,
    color: COLORS.BLACK,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
  },
  imageButtonText: {
    marginLeft: SPACING.small,
    fontSize: FONTS.SIZES.medium,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.medium,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  separatorText: {
    marginHorizontal: SPACING.medium,
    fontSize: FONTS.SIZES.small,
    color: COLORS.GRAY,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
    marginRight: SPACING.small,
  },
  cancelButtonText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.BLACK,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    marginLeft: SPACING.small,
  },
  saveButtonText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
});

export default PhotoManagement;