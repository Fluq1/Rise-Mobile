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
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { CustomButton, CustomInput, CustomTitle } from '../components/CustomComponents';
import { validateUsername } from '../utils/validators';
import { loginWithEmailAndPassword, sendPasswordReset } from '/Users/heitor/Aulas LOCAL/BOER/outro/appPrimas/firebase/FirebaseAuth.js';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      
      try {
        const result = await loginWithEmailAndPassword(email, password);
        
        if (result.success) {
          navigation.navigate('Home');
        } else {
          let errorMessage = 'Falha no login. Verifique suas credenciais.';
          
          if (result.error.includes('user-not-found')) {
            errorMessage = 'Usuário não encontrado.';
          } else if (result.error.includes('wrong-password')) {
            errorMessage = 'Senha incorreta.';
          }
          
          Alert.alert('Erro no Login', errorMessage);
        }
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro durante o login. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Informe seu email para recuperar a senha' }));
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await sendPasswordReset(email);
      
      if (result.success) {
        Alert.alert(
          'Email Enviado',
          'Instruções para redefinir sua senha foram enviadas para seu email.'
        );
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o email de redefinição. Verifique o endereço de email.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <CustomTitle 
            title="Bem-vindo de volta" 
            subtitle="Faça login na sua conta"
          />
          
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            icon={<Feather name="mail" size={20} color={COLORS.GRAY} />}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={() => {
              if (!email || !/\S+@\S+\.\S+/.test(email)) {
                setErrors(prev => ({ ...prev, email: 'Email é obrigatório e deve ser válido' }));
              } else {
                setErrors(prev => ({ ...prev, email: null }));
              }
            }}
          />
          
          <CustomInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon={<Feather name="lock" size={20} color={COLORS.GRAY} />}
            error={errors.password}
            onBlur={() => {
              if (!password) {
                setErrors(prev => ({ ...prev, password: 'Senha é obrigatória' }));
              } else {
                setErrors(prev => ({ ...prev, password: null }));
              }
            }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.GRAY} 
                />
              </TouchableOpacity>
            }
          />
          
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          
          <CustomButton
            title="ENTRAR"
            onPress={handleLogin}
            loading={loading}
            gradient
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Cadastre-se</Text>
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
    backgroundColor: COLORS.WHITE,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.large,
    paddingTop: SPACING.xl * 2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    backgroundColor: COLORS.GRAY_LIGHT,
    marginBottom: SPACING.large,
  },
  logo: {
    width: 80,
    height: 80,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.large,
  },
  forgotPasswordText: {
    color: COLORS.PRIMARY,
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.large,
  },
  signupText: {
    color: COLORS.GRAY,
    fontSize: FONTS.SIZES.medium,
  },
  signupLink: {
    color: COLORS.PRIMARY,
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.semibold,
  },
});

export default LoginScreen;