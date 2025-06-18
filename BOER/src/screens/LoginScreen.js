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
import { loginWithEmailAndPassword, sendPasswordReset, signInWithGoogle, auth } from '../../firebase/FirebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

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
  
  // Add the authentication check useEffect inside the component
  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário já está autenticado, redirecionar para Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    });
    
    // Limpar listener ao desmontar
    return unsubscribe;
  }, [navigation]);

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
          // Navegue para a tela inicial e redefina a pilha de navegação
          // para que o usuário não possa voltar para a tela de login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Navegue para a tela inicial e redefina a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        Alert.alert('Erro no Login', 'Não foi possível fazer login com o Google.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante o login com Google.');
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
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({...errors, email: null});
            }}
            icon={<Feather name="mail" size={20} color={COLORS.GRAY} />}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <CustomInput
            placeholder="Senha"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({...errors, password: null});
            }}
            secureTextEntry={!showPassword}
            icon={<Feather name="lock" size={20} color={COLORS.GRAY} />}
            error={errors.password}
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
          
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          
          <CustomButton
            title="ENTRAR"
            onPress={handleLogin}
            loading={loading}
            gradient
          />
          
          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OU</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.googleButtonContent}>
              <Image
                source={require('../../assets/logo.webp')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continuar com Google</Text>
            </View>
          </TouchableOpacity>
          
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
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.large,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    width: 80,
    height: 80,
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.medium,
  },
  forgotPasswordText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: FONTS.SIZES.medium,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.large,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  orText: {
    color: COLORS.GRAY,
    marginHorizontal: SPACING.small,
    fontSize: FONTS.SIZES.medium,
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.small,
  },
  googleButtonText: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.BLACK,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.large,
  },
  signupText: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY,
  },
  signupLink: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.PRIMARY_DARK,
    fontWeight: FONTS.WEIGHTS.bold,
  },
});

export default LoginScreen;

// Remove the duplicate useEffect that was here