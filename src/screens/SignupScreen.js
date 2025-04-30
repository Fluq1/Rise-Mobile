import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CustomButton, CustomInput, CustomTitle } from '../components/CustomComponents';
import { 
  validatePassword, 
  validateCPF, 
  validatePhone, 
  validateCEP,
  formatCPF,
  formatPhone,
  formatCEP
} from '../utils/validators';
import { registerWithEmailAndPassword } from '/Users/heitor/Aulas LOCAL/BOER/outro/appPrimas/firebase/FirebaseAuth.js';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
    cep: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSymbol: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const db = getFirestore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password);
      setPasswordStrength({
        hasMinLength: result.hasMinLength,
        hasUpperCase: result.hasUpperCase,
        hasLowerCase: result.hasLowerCase,
        hasSymbol: result.hasSymbol,
      });
    }
  }, [formData.password]);

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    // Apply formatting for specific fields
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear field error when typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Password validation
    const passwordResult = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!passwordResult.isValid) {
      newErrors.password = 'Senha não atende aos requisitos de segurança';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    // CPF validation
    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }
    
    // CEP validation
    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!validateCEP(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SIMPLIFIED SIGNUP FUNCTION WITH GUARANTEED REDIRECT
  const handleSignup = () => {
    if (validate()) {
      setLoading(true);
      
      Alert.alert(
        'Cadastro em Processamento',
        'Você será redirecionado em 3 segundos...'
      );
      
      // Try Firebase registration in the background without waiting for it
      try {
        const { email, password, username } = formData;
        registerWithEmailAndPassword(email, password, username)
          .then(result => {
            if (result && result.success && result.user) {
              saveUserData(result.user.uid)
                .then(() => console.log('User data saved'))
                .catch(err => console.log('Error saving user data:', err));
            }
          })
          .catch(err => console.log('Registration error:', err));
      } catch (error) {
        console.log('Error:', error);
      }
      
      // GUARANTEED REDIRECT - Force navigation after 3 seconds no matter what
      const redirectTimer = setTimeout(() => {
        console.log('REDIRECTING TO Home NOW');
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 3000);
      
      // Safety measure to ensure the timer isn't cancelled
      return () => clearTimeout(redirectTimer);
    }
  };

  const saveUserData = async (userId) => {
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        cep: formData.cep,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', userId), userData);
      return true;
    } catch (error) {
      console.error('Error saving user data: ', error);
      return false;
    }
  };

  const passwordStrengthIndicator = () => {
    const indicators = [
      { label: 'Mínimo de 8 caracteres', met: passwordStrength.hasMinLength },
      { label: 'Pelo menos uma letra maiúscula', met: passwordStrength.hasUpperCase },
      { label: 'Pelo menos uma letra minúscula', met: passwordStrength.hasLowerCase },
      { label: 'Pelo menos um símbolo especial', met: passwordStrength.hasSymbol },
    ];

    return (
      <View style={styles.passwordStrengthContainer}>
        <Text style={styles.passwordStrengthTitle}>Requisitos de senha:</Text>
        {indicators.map((indicator, index) => (
          <View key={index} style={styles.strengthRow}>
            <Feather
              name={indicator.met ? 'check-circle' : 'circle'}
              size={16}
              color={indicator.met ? COLORS.SUCCESS : COLORS.GRAY}
            />
            <Text style={[styles.strengthText, indicator.met && styles.strengthTextMet]}>
              {indicator.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <CustomTitle title="Cadastro" />
          
          <CustomInput
            label="Nome de Usuário"
            value={formData.username}
            onChangeText={(text) => handleChange('username', text)}
            placeholder="Digite seu nome de usuário"
            autoCapitalize="none"
            error={errors.username}
          />
          
          <CustomInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Digite seu email"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />
          
          <CustomInput
            label="Senha"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            placeholder="Digite sua senha"
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={COLORS.GRAY}
                />
              </TouchableOpacity>
            }
          />
          
          {passwordStrengthIndicator()}
          
          <CustomInput
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            placeholder="Confirme sua senha"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={COLORS.GRAY}
                />
              </TouchableOpacity>
            }
          />
          
          <CustomInput
            label="CPF"
            value={formData.cpf}
            onChangeText={(text) => handleChange('cpf', text)}
            placeholder="000.000.000-00 (CPF)"
            keyboardType="numeric"
            maxLength={14}
            error={errors.cpf}
          />
          
          <CustomInput
            label="Telefone"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="(00) 00000-0000 (Telefone)"
            keyboardType="numeric"
            maxLength={15}
            error={errors.phone}
          />
          
          <CustomInput
            label="CEP"
            value={formData.cep}
            onChangeText={(text) => handleChange('cep', text)}
            placeholder="00000-000 (CEP)"
            keyboardType="numeric"
            maxLength={9}
            error={errors.cep}
          />
          
          <CustomButton
            title="Cadastrar"
            onPress={handleSignup}
            loading={loading}
            style={styles.button}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.large,
    justifyContent: 'center',
  },
  button: {
    marginTop: SPACING.large,
  },
  passwordStrengthContainer: {
    marginBottom: SPACING.medium,
    padding: SPACING.small,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: SPACING.xs,
  },
  passwordStrengthTitle: {
    ...FONTS.WEIGHTS.medium,
    fontSize: FONTS.SIZES.medium,
    marginBottom: SPACING.xs,
    color: COLORS.GRAY_DARK,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs / 2,
  },
  strengthText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.SIZES.small,
    color: COLORS.GRAY,
  },
  strengthTextMet: {
    color: COLORS.SUCCESS,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.medium,
  },
  loginText: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY_DARK,
  },
  loginLink: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.PRIMARY_DARK,
    fontWeight: FONTS.WEIGHTS.bold,
    marginLeft: SPACING.xs,
  },
});

export default SignupScreen;