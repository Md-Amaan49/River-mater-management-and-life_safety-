// ValidationUtils.js - Comprehensive validation utilities for registration form

/**
 * Email validation using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Name validation - only letters and spaces allowed
 * @param {string} name - Name to validate
 * @returns {boolean} - True if name is valid
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name.trim()) && name.trim().length > 0;
};

/**
 * Mobile number validation - Indian format (10 digits starting with 6-9)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - True if mobile is valid
 */
export const validateMobile = (mobile) => {
  if (!mobile || typeof mobile !== 'string') return false;
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.trim());
};

/**
 * Password minimum length validation
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets minimum requirements
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

/**
 * Required field validation
 * @param {string} value - Value to validate
 * @returns {boolean} - True if field is not empty
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
};

/**
 * Password confirmation matching validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} - True if passwords match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
};

/**
 * Calculate password strength score and provide feedback
 * @param {string} password - Password to analyze
 * @returns {Object} - Strength analysis object
 */
export const calculatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      feedback: ['Password is required'],
      color: 'red',
      label: 'Very Weak'
    };
  }

  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 6) score += 1;
  else feedback.push('Use at least 6 characters');
  
  if (password.length >= 8) score += 1;
  else if (password.length >= 6) feedback.push('Consider using 8+ characters for better security');
  
  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (hasLowercase) score += 0.5;
  else feedback.push('Add lowercase letters');
  
  if (hasUppercase) score += 0.5;
  else feedback.push('Add uppercase letters');
  
  if (hasNumbers) score += 0.5;
  else feedback.push('Add numbers');
  
  if (hasSpecialChars) score += 0.5;
  else feedback.push('Add special characters (!@#$%^&*)');
  
  // Avoid common patterns
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  
  if (hasRepeatingChars) {
    score -= 0.5;
    feedback.push('Avoid repeating characters');
  }
  
  if (hasSequentialChars) {
    score -= 0.5;
    feedback.push('Avoid sequential characters');
  }
  
  // Normalize score to 0-4 range
  score = Math.max(0, Math.min(4, score));
  
  // Determine color and label based on score
  let color, label;
  if (score < 2) {
    color = 'red';
    label = score < 1 ? 'Very Weak' : 'Weak';
  } else if (score < 3) {
    color = 'yellow';
    label = 'Medium';
  } else {
    color = 'green';
    label = score >= 4 ? 'Very Strong' : 'Strong';
  }
  
  // If no feedback, password is good
  if (feedback.length === 0) {
    feedback.push('Great password!');
  }
  
  return {
    score: Math.round(score),
    feedback,
    color,
    label
  };
};

/**
 * Get validation error message for a specific field
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @param {Object} additionalData - Additional data for validation (e.g., confirmPassword)
 * @returns {string|null} - Error message or null if valid
 */
export const getValidationError = (fieldName, value, additionalData = {}) => {
  switch (fieldName) {
    case 'name':
      if (!validateRequired(value)) return 'Name is required';
      if (!validateName(value)) return 'Name should contain only letters and spaces';
      return null;
      
    case 'email':
      if (!validateRequired(value)) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return null;
      
    case 'password':
      if (!validateRequired(value)) return 'Password is required';
      if (!validatePassword(value)) return 'Password must be at least 6 characters long';
      return null;
      
    case 'confirmPassword':
      if (!validateRequired(value)) return 'Password confirmation is required';
      if (!validatePasswordMatch(additionalData.password, value)) {
        return 'Passwords do not match';
      }
      return null;
      
    case 'mobile':
      if (!validateRequired(value)) return 'Mobile number is required';
      if (!validateMobile(value)) return 'Please enter a valid 10-digit mobile number starting with 6-9';
      return null;
      
    case 'place':
      if (!validateRequired(value)) return 'Place is required';
      return null;
      
    case 'state':
      if (!validateRequired(value)) return 'State is required';
      return null;
      
    default:
      return null;
  }
};

/**
 * Validate entire form and return all errors
 * @param {Object} formData - Form data object
 * @returns {Object} - Object containing all validation errors
 */
export const validateForm = (formData) => {
  const errors = {};
  
  // Validate each field
  const fieldsToValidate = ['name', 'email', 'password', 'confirmPassword', 'mobile', 'place', 'state'];
  
  fieldsToValidate.forEach(field => {
    const error = getValidationError(field, formData[field], { password: formData.password });
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

/**
 * Check if form has any validation errors
 * @param {Object} errors - Validation errors object
 * @returns {boolean} - True if form has errors
 */
export const hasValidationErrors = (errors) => {
  return Object.values(errors).some(error => error !== null && error !== '');
};

/**
 * Format mobile number for display (adds spaces for readability)
 * @param {string} mobile - Mobile number
 * @returns {string} - Formatted mobile number
 */
export const formatMobileNumber = (mobile) => {
  if (!mobile || typeof mobile !== 'string') return '';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return mobile;
};

/**
 * Clean mobile number input (remove non-digits)
 * @param {string} mobile - Mobile number input
 * @returns {string} - Cleaned mobile number
 */
export const cleanMobileNumber = (mobile) => {
  if (!mobile || typeof mobile !== 'string') return '';
  return mobile.replace(/\D/g, '').slice(0, 10); // Limit to 10 digits
};