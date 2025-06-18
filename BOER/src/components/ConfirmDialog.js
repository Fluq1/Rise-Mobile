import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const ConfirmDialog = ({ 
  visible, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel,
  danger = false
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.button, 
                      styles.confirmButton,
                      danger && styles.dangerButton
                    ]} 
                    onPress={onConfirm}
                  >
                    <Text style={[
                      styles.confirmButtonText,
                      danger && styles.dangerButtonText
                    ]}>
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 340,
  },
  dialog: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: SPACING.large,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
    marginBottom: SPACING.small,
  },
  message: {
    fontSize: FONTS.SIZES.medium,
    color: COLORS.GRAY,
    marginBottom: SPACING.large,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginLeft: SPACING.small,
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  dangerButton: {
    backgroundColor: COLORS.ERROR,
  },
  cancelButtonText: {
    color: COLORS.GRAY_DARK,
    fontWeight: FONTS.WEIGHTS.medium,
    fontSize: FONTS.SIZES.medium,
  },
  confirmButtonText: {
    color: COLORS.BLACK,
    fontWeight: FONTS.WEIGHTS.medium,
    fontSize: FONTS.SIZES.medium,
  },
  dangerButtonText: {
    color: COLORS.WHITE,
  },
});

export default ConfirmDialog;