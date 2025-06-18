import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CustomButton, CustomInput, CustomTitle } from '../components/CustomComponents';
import { createCategory, updateCategory } from '../../firebase/FirebaseCategories';

const CategoryFormScreen = ({ navigation, route }) => {
  // Estado para os campos do formulário
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  
  // Estado para controle de UI
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Efeito para carregar dados se estiver editando
  useEffect(() => {
    if (route.params?.item) {
      const item = route.params.item;
      setId(item.id);
      setName(item.name || '');
      setDescription(item.description || '');
      setIcon(item.icon || '');
      setIsEditing(true);
    }
  }, [route.params]);

  // Validação de campos
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!name.trim()) {
      novosErros.name = 'Nome da categoria é obrigatório';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar categoria no Firebase
  const salvarCategoria = async () => {
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    const categoryData = {
      name,
      description,
      icon,
      timestamp: Date.now()
    };
    
    try {
      let result;
      
      if (isEditing) {
        // Atualizar categoria existente
        result = await updateCategory(id, categoryData);
        if (result.success) {
          Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
          limparFormulario();
          navigation.goBack();
        } else {
          Alert.alert('Erro', result.error || 'Não foi possível atualizar a categoria.');
        }
      } else {
        // Criar nova categoria
        result = await createCategory(categoryData);
        if (result.success) {
          Alert.alert('Sucesso', 'Categoria cadastrada com sucesso!');
          limparFormulario();
          navigation.goBack();
        } else {
          Alert.alert('Erro', result.error || 'Não foi possível cadastrar a categoria.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a categoria.');
    } finally {
      setLoading(false);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setId('');
    setName('');
    setDescription('');
    setIcon('');
    setErrors({});
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <CustomTitle 
          title={isEditing ? 'Editar Categoria' : 'Nova Categoria'} 
          subtitle="Preencha os dados da categoria"
        />

        <CustomInput
          placeholder="Nome da Categoria"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({...errors, name: null});
          }}
          error={errors.name}
          icon={<Feather name="tag" size={20} color={COLORS.GRAY} />}
          autoCapitalize="words"
        />

        <CustomInput
          placeholder="Descrição (opcional)"
          value={description}
          onChangeText={(text) => setDescription(text)}
          error={errors.description}
          icon={<Feather name="align-left" size={20} color={COLORS.GRAY} />}
          autoCapitalize="sentences"
          multiline
        />

        <CustomInput
          placeholder="Ícone (opcional)"
          value={icon}
          onChangeText={(text) => setIcon(text)}
          error={errors.icon}
          icon={<Feather name="image" size={20} color={COLORS.GRAY} />}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={isEditing ? 'ATUALIZAR CATEGORIA' : 'CADASTRAR CATEGORIA'}
            onPress={salvarCategoria}
            loading={loading}
            gradient
          />
          
          <CustomButton
            title="CANCELAR"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    padding: SPACING.large,
  },
  buttonContainer: {
    marginTop: SPACING.large,
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  cancelButtonText: {
    color: COLORS.GRAY_DARK,
  },
});

export default CategoryFormScreen;