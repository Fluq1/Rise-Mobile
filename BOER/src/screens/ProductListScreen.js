import React, { useState, useEffect } from 'react'; 
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
import { getDatabase, ref, onValue, off, remove } from 'firebase/database';
import ConfirmDialog from '../components/ConfirmDialog';

const ProductListScreen = ({ navigation }) => { 
  const [produtos, setProdutos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { 
    carregarProdutos(); 
    
    // Adicionar listener para atualizar a lista quando voltar para esta tela 
    const unsubscribe = navigation.addListener('focus', () => { 
      carregarProdutos(); 
    }); 
    
    return () => { 
      // Limpar listeners 
      unsubscribe(); 
      const db = getDatabase(); 
      const produtosRef = ref(db, 'produtos'); 
      off(produtosRef); 
    }; 
  }, [navigation]); 

  const carregarProdutos = () => { 
    setLoading(true); 
    const db = getDatabase(); 
    const produtosRef = ref(db, 'produtos'); 
    
    onValue(produtosRef, (snapshot) => { 
      const data = snapshot.val(); 
      const produtosList = []; 
      
      if (data) { 
        Object.keys(data).forEach(key => { 
          produtosList.push({ 
            id: key, 
            ...data[key] 
          }); 
        }); 
      } 
      
      // Ordenar por timestamp (mais recente primeiro) 
      produtosList.sort((a, b) => b.timestamp - a.timestamp); 
      
      setProdutos(produtosList); 
      setLoading(false); 
    }, (error) => { 
      console.error('Erro ao carregar produtos:', error); 
      Alert.alert('Erro', 'Não foi possível carregar os produtos.'); 
      setLoading(false); 
    }); 
  }; 

  const confirmarExclusao = (id, nome) => { 
    if (deleting) return; // Prevent multiple delete operations
    
    // Instead of using Alert, set the selected product and show the dialog
    setSelectedProduct({ id, nome });
    setDialogVisible(true);
  }; 

  const excluirProduto = async (id) => { 
    setDeleting(true);
    setDialogVisible(false);
    
    try { 
      const db = getDatabase();
      await remove(ref(db, `produtos/${id}`)); 
      Alert.alert('Sucesso', 'Cadastro excluído com sucesso!'); 
    } catch (error) { 
      console.error('Erro ao excluir produto:', error); 
      Alert.alert('Erro', 'Não foi possível excluir o cadastro.'); 
    } finally { 
      setDeleting(false);
      setSelectedProduct(null);
    } 
  }; 

  const renderItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Form', { item })} 
    > 
      <View style={styles.cardContent}> 
        <View style={styles.cardHeader}> 
          <Text style={styles.cardTitle}>{item.nome}</Text> 
          <View style={styles.cardActions}> 
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.navigate('Form', { item })} 
            > 
              <Feather name="edit" size={20} color={COLORS.PRIMARY} /> 
            </TouchableOpacity> 
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => confirmarExclusao(item.id, item.nome)} 
            > 
              <Feather name="trash-2" size={20} color={COLORS.ERROR} /> 
            </TouchableOpacity> 
          </View> 
        </View> 
        
        <View style={styles.cardInfo}> 
          <View style={styles.infoItem}> 
            <Feather name="credit-card" size={16} color={COLORS.GRAY} /> 
            <Text style={styles.infoText}>{item.cpf}</Text> 
          </View> 
          <View style={styles.infoItem}> 
            <Feather name="phone" size={16} color={COLORS.GRAY} /> 
            <Text style={styles.infoText}>{item.telefone}</Text> 
          </View> 
          <View style={styles.infoItem}> 
            <Feather name="map-pin" size={16} color={COLORS.GRAY} /> 
            <Text style={styles.infoText}>{item.cep}</Text> 
          </View> 
          <View style={styles.infoItem}> 
            <Feather name="home" size={16} color={COLORS.GRAY} /> 
            <Text style={styles.infoText} numberOfLines={2}>{item.endereco}</Text> 
          </View> 
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
        <Text style={styles.headerTitle}>Cadastros</Text> 
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('Form')} 
        > 
          <Feather name="plus" size={24} color={COLORS.BLACK} /> 
        </TouchableOpacity> 
      </View> 

      {loading ? ( 
        <View style={styles.loadingContainer}> 
          <ActivityIndicator size="large" color={COLORS.PRIMARY} /> 
          <Text style={styles.loadingText}>Carregando...</Text> 
        </View> 
      ) : produtos.length === 0 ? ( 
        <View style={styles.emptyContainer}> 
          <Feather name="inbox" size={64} color={COLORS.GRAY_LIGHT} /> 
          <Text style={styles.emptyText}>Nenhum cadastro encontrado</Text> 
          <CustomButton 
            title="ADICIONAR CADASTRO" 
            onPress={() => navigation.navigate('Form')} 
            gradient 
            style={styles.emptyButton} 
          /> 
        </View> 
      ) : ( 
        <FlatList 
          data={produtos} 
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
        message={selectedProduct ? `Deseja realmente excluir o cadastro de ${selectedProduct.nome}?` : ""}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => selectedProduct && excluirProduto(selectedProduct.id)}
        onCancel={() => {
          setDialogVisible(false);
          setSelectedProduct(null);
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
    paddingVertical: SPACING.medium, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.GRAY_LIGHT, 
  }, 
  backButton: { 
    padding: SPACING.small, 
  }, 
  headerTitle: { 
    fontSize: FONTS.SIZES.large, 
    fontWeight: FONTS.WEIGHTS.bold, 
    color: COLORS.BLACK, 
  }, 
  addButton: { 
    padding: SPACING.small, 
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
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SPACING.large, 
  }, 
  emptyText: { 
    fontSize: FONTS.SIZES.medium, 
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
    borderRadius: 12, 
    marginBottom: SPACING.medium, 
    ...SHADOWS.medium, 
  }, 
  cardContent: { 
    padding: SPACING.medium, 
  }, 
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.medium, 
  }, 
  cardTitle: { 
    fontSize: FONTS.SIZES.medium, 
    fontWeight: FONTS.WEIGHTS.bold, 
    color: COLORS.BLACK, 
    flex: 1, 
  }, 
  cardActions: { 
    flexDirection: 'row', 
  }, 
  actionButton: { 
    padding: SPACING.small, 
    marginLeft: SPACING.small, 
  }, 
  cardInfo: { 
    borderTopWidth: 1, 
    borderTopColor: COLORS.GRAY_LIGHT, 
    paddingTop: SPACING.medium, 
  }, 
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.small, 
  }, 
  infoText: { 
    fontSize: FONTS.SIZES.small, 
    color: COLORS.GRAY, 
    marginLeft: SPACING.small, 
    flex: 1, 
  }, 
}); 

export default ProductListScreen;