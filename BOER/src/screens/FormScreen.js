import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CustomButton, CustomInput, CustomTitle } from '../components/CustomComponents';
import { getDatabase, ref, set, push, get, remove, update, onValue, off } from 'firebase/database';
import { TextInputMask } from 'react-native-masked-text';

const FormScreen = ({ navigation, route }) => {
  // Estado para os campos do formulário
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  
  // Estado para controle de UI
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Referências para os inputs com máscara
  const cpfRef = React.useRef(null);
  const telefoneRef = React.useRef(null);
  const cepRef = React.useRef(null);

  // Efeito para carregar dados se estiver editando
  useEffect(() => {
    if (route.params?.item) {
      const item = route.params.item;
      setId(item.id);
      setNome(item.nome || '');
      setCpf(item.cpf || '');
      setTelefone(item.telefone || '');
      setCep(item.cep || '');
      setEndereco(item.endereco || '');
      setIsEditing(true);
    }
    
    // Carregar lista de produtos do Firebase
    carregarProdutos();
    
    return () => {
      // Limpar listeners ao desmontar o componente
      const db = getDatabase();
      const produtosRef = ref(db, 'produtos');
      off(produtosRef);
    };
  }, [route.params]);

  // Função para carregar produtos do Firebase
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
      
      setProdutos(produtosList);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
      setLoading(false);
    });
  };

  // Validação de campos
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!cpf.trim() || !cpfRef.current.isValid()) {
      novosErros.cpf = 'CPF inválido';
    }
    
    if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Telefone inválido';
    }
    
    if (!cep.trim() || cep.replace(/\D/g, '').length !== 8) {
      novosErros.cep = 'CEP inválido';
    }
    
    if (!endereco.trim()) {
      novosErros.endereco = 'Endereço é obrigatório';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Buscar endereço pelo CEP
  const buscarCep = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrors(prev => ({ ...prev, cep: 'CEP inválido' }));
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
      } else {
        setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        setErrors(prev => ({ ...prev, cep: null, endereco: null }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setLoading(false);
    }
  };

  // Salvar produto no Firebase
  const salvarProduto = async () => {
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    const db = getDatabase();
    const produtoData = {
      nome,
      cpf,
      telefone,
      cep,
      endereco,
      timestamp: Date.now()
    };
    
    try {
      if (isEditing) {
        // Atualizar produto existente
        await update(ref(db, `produtos/${id}`), produtoData);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        const newProdutoRef = push(ref(db, 'produtos'));
        await set(newProdutoRef, produtoData);
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      }
      
      // Limpar formulário e voltar
      limparFormulario();
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  // Excluir produto
  const confirmarExclusao = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este registro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          onPress: excluirProduto,
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  const excluirProduto = async () => {
    if (!id) return;
    
    setLoading(true);
    const db = getDatabase();
    
    try {
      await remove(ref(db, `produtos/${id}`));
      Alert.alert('Sucesso', 'Produto excluído com sucesso!');
      limparFormulario();
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    } finally {
      setLoading(false);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setId('');
    setNome('');
    setCpf('');
    setTelefone('');
    setCep('');
    setEndereco('');
    setIsEditing(false);
    setErrors({});
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
          {isEditing ? 'Editar Cadastro' : 'Novo Cadastro'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <CustomTitle 
          title={isEditing ? 'Editar Cadastro' : 'Novo Cadastro'} 
          subtitle="Preencha todos os campos obrigatórios"
        />
        
        <CustomInput
          placeholder="Nome Completo *"
          value={nome}
          onChangeText={setNome}
          icon={<Feather name="user" size={20} color={COLORS.GRAY} />}
          error={errors.nome}
          onBlur={() => {
            if (!nome.trim()) {
              setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }));
            } else {
              setErrors(prev => ({ ...prev, nome: null }));
            }
          }}
        />
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Feather name="credit-card" size={20} color={COLORS.GRAY} />
          </View>
          <TextInputMask
            type={'cpf'}
            value={cpf}
            onChangeText={setCpf}
            style={[
              styles.maskedInput,
              errors.cpf ? styles.inputError : null
            ]}
            placeholder="CPF *"
            keyboardType="numeric"
            ref={cpfRef}
            onBlur={() => {
              if (!cpf.trim() || !cpfRef.current.isValid()) {
                setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
              } else {
                setErrors(prev => ({ ...prev, cpf: null }));
              }
            }}
          />
        </View>
        {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Feather name="phone" size={20} color={COLORS.GRAY} />
          </View>
          <TextInputMask
            type={'cel-phone'}
            options={{
              maskType: 'BRL',
              withDDD: true,
              dddMask: '(99) '
            }}
            value={telefone}
            onChangeText={setTelefone}
            style={[
              styles.maskedInput,
              errors.telefone ? styles.inputError : null
            ]}
            placeholder="Telefone *"
            keyboardType="numeric"
            ref={telefoneRef}
            onBlur={() => {
              if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) {
                setErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }));
              } else {
                setErrors(prev => ({ ...prev, telefone: null }));
              }
            }}
          />
        </View>
        {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
        
        <View style={styles.cepContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <View style={styles.iconContainer}>
              <Feather name="map-pin" size={20} color={COLORS.GRAY} />
            </View>
            <TextInputMask
              type={'zip-code'}
              value={cep}
              onChangeText={setCep}
              style={[
                styles.maskedInput,
                errors.cep ? styles.inputError : null
              ]}
              placeholder="CEP *"
              keyboardType="numeric"
              ref={cepRef}
              onBlur={() => {
                if (cep.replace(/\D/g, '').length === 8) {
                  buscarCep();
                } else if (cep.trim()) {
                  setErrors(prev => ({ ...prev, cep: 'CEP inválido' }));
                }
              }}
            />
          </View>
          <TouchableOpacity 
            style={styles.cepButton}
            onPress={buscarCep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.cepButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
        {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
        
        <CustomInput
          placeholder="Endereço *"
          value={endereco}
          onChangeText={setEndereco}
          icon={<Feather name="home" size={20} color={COLORS.GRAY} />}
          error={errors.endereco}
          onBlur={() => {
            if (!endereco.trim()) {
              setErrors(prev => ({ ...prev, endereco: 'Endereço é obrigatório' }));
            } else {
              setErrors(prev => ({ ...prev, endereco: null }));
            }
          }}
        />
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isEditing ? "ATUALIZAR" : "CADASTRAR"}
            onPress={salvarProduto}
            loading={loading}
            gradient
          />
          
          {isEditing && (
            <CustomButton
              title="EXCLUIR"
              onPress={confirmarExclusao}
              loading={loading}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          )}
          
          <CustomButton
            title="CANCELAR"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
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
  scrollContainer: {
    padding: SPACING.large,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    marginBottom: SPACING.small,
    backgroundColor: COLORS.WHITE,
  },
  iconContainer: {
    padding: SPACING.medium,
    borderRightWidth: 1,
    borderRightColor: COLORS.GRAY_LIGHT,
  },
  maskedInput: {
    flex: 1,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    fontSize: FONTS.SIZES.medium,
    color: COLORS.BLACK,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.small,
    marginBottom: SPACING.small,
    marginLeft: SPACING.small,
  },
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  cepButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cepButtonText: {
    color: COLORS.BLACK,
    fontWeight: FONTS.WEIGHTS.bold,
    fontSize: FONTS.SIZES.medium,
  },
  buttonContainer: {
    marginTop: SPACING.large,
  },
  deleteButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    marginTop: SPACING.medium,
  },
  deleteButtonText: {
    color: COLORS.ERROR,
  },
  cancelButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    marginTop: SPACING.medium,
  },
  cancelButtonText: {
    color: COLORS.GRAY,
  },
});

export default FormScreen;