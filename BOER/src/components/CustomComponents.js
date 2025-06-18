import React from 'react';
import { 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const CustomButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  disabled = false,
  loading = false,
  gradient = false,
}) => {
  const ButtonComponent = gradient ? LinearGradient : View;
  const gradientProps = gradient ? {
    colors: [COLORS.PRIMARY, COLORS.PRIMARY_DARK],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } : {};

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[
        styles.buttonContainer,
        disabled && styles.buttonDisabled,
        style
      ]}
      activeOpacity={0.7}
    >
      <ButtonComponent
        {...gradientProps}
        style={[
          styles.button,
          !gradient && { backgroundColor: COLORS.PRIMARY },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.WHITE} size="small" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>
            {title}
          </Text>
        )}
      </ButtonComponent>
    </TouchableOpacity>
  );
};

export const CustomInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry,
  keyboardType,
  style,
  icon,
  error,
  onBlur,
  maxLength,
  autoCapitalize = 'none',
  mask,
  ...props
}) => {
  const handleChangeText = (text) => {
    // Apply mask if provided
    if (mask) {
      text = mask(text);
    }
    onChangeText(text);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={[
        styles.inputWrapper, 
        style,
        error ? styles.inputError : null
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          style={styles.input}
          placeholderTextColor={COLORS.GRAY}
          autoCapitalize={autoCapitalize}
          onBlur={onBlur}
          maxLength={maxLength}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const CustomTitle = ({ title, subtitle, style }) => {
  return (
    <View style={[styles.titleContainer, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    ...SHADOWS.medium,
    marginVertical: SPACING.medium,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.semibold,
    color: COLORS.BLACK,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 16,
    paddingHorizontal: SPACING.medium,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FONTS.SIZES.large,
    color: COLORS.BLACK,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.small,
    marginTop: 4,
    marginLeft: SPACING.small,
  },
  iconContainer: {
    marginRight: SPACING.small,
  },
  titleContainer: {
    marginBottom: SPACING.large,
  },
  title: {
    fontSize: FONTS.SIZES.h1,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.SIZES.large,
    color: COLORS.GRAY,
  },
});