// CPF validation and formatting
export const formatCPF = (cpf) => {
    // Remove non-numeric characters
    cpf = cpf.replace(/\D/g, '');
    
    // Apply the mask: 000.000.000-00
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    }
  };
  
  export const validateCPF = (cpf) => {
    // Remove non-numeric characters
    cpf = cpf.replace(/\D/g, '');
    
    // Check if length is 11
    if (cpf.length !== 11) {
      return false;
    }
    
    // Check for all same digits
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }
    
    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let checkDigit1 = remainder > 9 ? 0 : remainder;
    
    if (checkDigit1 !== parseInt(cpf.charAt(9))) {
      return false;
    }
    
    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    let checkDigit2 = remainder > 9 ? 0 : remainder;
    
    return checkDigit2 === parseInt(cpf.charAt(10));
  };
  
  // Phone validation and formatting
  export const formatPhone = (phone) => {
    // Remove non-numeric characters
    phone = phone.replace(/\D/g, '');
    
    // Apply the mask: (00) 00000-0000
    if (phone.length <= 2) {
      return phone;
    } else if (phone.length <= 7) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    } else {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
    }
  };
  
  export const validatePhone = (phone) => {
    // Remove non-numeric characters
    phone = phone.replace(/\D/g, '');
    
    // Check if length is 10 (landline) or 11 (mobile)
    return phone.length === 10 || phone.length === 11;
  };
  
  // CEP validation and formatting
  export const formatCEP = (cep) => {
    // Remove non-numeric characters
    cep = cep.replace(/\D/g, '');
    
    // Apply the mask: 00000-000
    if (cep.length <= 5) {
      return cep;
    } else {
      return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
    }
  };
  
  export const validateCEP = (cep) => {
    // Remove non-numeric characters
    cep = cep.replace(/\D/g, '');
    
    // Check if length is 8
    return cep.length === 8;
  };
  
  // Password validation
  export const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasSymbol;
    
    return {
      isValid,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasSymbol
    };
  };
  
  // Username validation
  export const validateUsername = (username) => {
    return username.length >= 3;
  };