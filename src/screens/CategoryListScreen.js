import React, { useState, useEffect, useCallback } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native'; 
import { Feather } from '@expo/vector-icons'; 
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants/theme'; 
import { CustomButton } from '../components/CustomComponents';
import { observeCategories, deleteCategory } from '../../firebase/FirebaseCategories';
import ConfirmDialog from '../components/ConfirmDialog';

const CategoryListScreen = ({ navigation }) => { 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key state

  // Create a loadCategories function that can be called to refresh data
  const loadCategories = useCallback(() => {
    setLoading(true);
    
    const unsubscribe = observeCategories((categoriesList) => {
      // Sort by timestamp (most recent first) 
      categoriesList.sort((a, b) => {
        const dateA = a.timestamp || 0;
        const dateB = b.timestamp || 0;
        return dateB - dateA;
      });
      
      setCategories(categoriesList); 
      setLoading(false); 
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => { 
    // Load categories when the component mounts or refreshKey changes
    const unsubscribe = loadCategories();
    
    // Add listener to update the list when returning to this screen
    const unsubscribeNavigation = navigation.addListener('focus', () => { 
      // Force a refresh when the screen comes into focus
      setRefreshKey(prevKey => prevKey + 1);
    }); 
    
    return () => { 
      // Clean up listeners
      unsubscribeNavigation(); 
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    }; 
  }, [navigation, refreshKey, loadCategories]); // Add refreshKey as a dependency

  const confirmarExclusao = (id, nome) => { 
    if (deleting) return; // Prevent multiple delete operations
    
    // Instead of using Alert, set the selected category and show the dialog
    setSelectedCategory({ id, nome });
    setDialogVisible(true);
  };

  const excluirCategoria = async (id) => { 
    setDeleting(true);
    setDialogVisible(false);
    
    try { 
      console.log("Deleting category with ID:", id);
      const result = await deleteCategory(id);
      
      if (result.success) {
        console.log("Category deleted successfully");
        // Use Alert for success message
        Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
        // Force a refresh after successful deletion
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        console.error("Failed to delete category:", result.error);
        Alert.alert('Erro', result.error || 'Não foi possível excluir a categoria.');
      }
    } catch (error) { 
      console.error('Erro ao excluir categoria:', error); 
      Alert.alert('Erro', 'Não foi possível excluir a categoria.'); 
    } finally { 
      setDeleting(false);
      setSelectedCategory(null);
    } 
  }; 

  const renderItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('CategoryForm', { item })} 
    > 
      <View style={styles.cardContent}> 
        <View style={styles.cardHeader}> 
          <Text style={styles.cardTitle}>{item.name}</Text> 
          <View style={styles.cardActions}> 
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.navigate('CategoryForm', { item })} 
            > 
              <Feather name="edit" size={20} color={COLORS.PRIMARY} /> 
            </TouchableOpacity> 
            <TouchableOpacity 
              style={[styles.actionButton, deleting ? styles.disabledButton : null]} 
              onPress={() => confirmarExclusao(item.id, item.name)}
              disabled={deleting}
            > 
              <Feather name="trash-2" size={20} color={COLORS.ERROR} /> 
            </TouchableOpacity> 
          </View> 
        </View> 
        
        <View style={styles.cardInfo}> 
          <View style={styles.infoItem}> 
            <Feather name="tag" size={16} color={COLORS.GRAY} /> 
            <Text style={styles.infoText}>{item.description || 'Sem descrição'}</Text> 
          </View>
          {item.productCount && (
            <View style={styles.infoItem}> 
              <Feather name="shopping-bag" size={16} color={COLORS.GRAY} /> 
              <Text style={styles.infoText}>{item.productCount} produtos</Text> 
            </View>
          )}
        </View> 
      </View> 
    </TouchableOpacity> 
  ); 

  return ( 
    <View style={styles.container}> 
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
          <Feather name="arrow-left" size={24} color={COLORS.BLACK} /> 
        </TouchableOpacity> 
        <Text style={styles.headerTitle}>Categorias</Text> 
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('CategoryForm')} 
        > 
          <Feather name="plus" size={24} color={COLORS.BLACK} /> 
        </TouchableOpacity> 
      </View> 

      {loading ? ( 
        <View style={styles.loadingContainer}> 
          <ActivityIndicator size="large" color={COLORS.PRIMARY} /> 
          <Text style={styles.loadingText}>Carregando...</Text> 
        </View> 
      ) : categories.length === 0 ? ( 
        <View style={styles.emptyContainer}> 
          <Feather name="tag" size={64} color={COLORS.GRAY_LIGHT} /> 
          <Text style={styles.emptyText}>Nenhuma categoria encontrada</Text> 
          <CustomButton 
            title="ADICIONAR CATEGORIA" 
            onPress={() => navigation.navigate('CategoryForm')} 
            gradient 
            style={styles.emptyButton} 
          /> 
        </View> 
      ) : ( 
        <FlatList 
          data={categories} 
          keyExtractor={(item) => item.id} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false} 
        /> 
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        visible={dialogVisible}
        title="Confirmar Exclusão"
        message={selectedCategory ? `Deseja realmente excluir a categoria "${selectedCategory.nome}"?` : ""}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => selectedCategory && excluirCategoria(selectedCategory.id)}
        onCancel={() => {
          setDialogVisible(false);
          setSelectedCategory(null);
        }}
        danger={true}
      />
    </View> 
  ); 
}; 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: COLORS.WHITE, 
  }, 
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.medium, 
    paddingVertical: SPACING.large,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: FONTS.SIZES.large,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
  },
  emptyText: {
    fontSize: FONTS.SIZES.large,
    color: COLORS.GRAY,
    marginTop: SPACING.medium,
    marginBottom: SPACING.large,
  },
  emptyButton: {
    width: '80%',
  },
  listContainer: {
    padding: SPACING.medium,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  cardContent: {
    padding: SPACING.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  cardTitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.GRAY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.small,
  },
  cardInfo: {
    marginTop: SPACING.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY,
    marginLeft: SPACING.small,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 

export default CategoryListScreen;