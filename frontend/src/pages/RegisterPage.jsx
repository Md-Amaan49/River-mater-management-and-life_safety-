import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  validateForm, 
  getValidationError, 
  hasValidationErrors,
  cleanMobileNumber 
} from "../utils/ValidationUtils";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import "../styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  
  // Form data state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    place: "",
    state: "",
    role: "user", // default
  });
  
  // Validation and UI state
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Handle field changes with real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Special processing for mobile number
    if (name === 'mobile') {
      processedValue = cleanMobileNumber(value);
    }
    
    // Update form data
    setForm(prevForm => ({
      ...prevForm,
      [name]: processedValue
    }));
    
    // Clear server error when user starts typing
    if (error) setError("");
    
    // Show password strength indicator when user starts typing password
    if (name === 'password') {
      setShowPasswordStrength(processedValue.length > 0);
    }
    
    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      const validationError = getValidationError(name, processedValue, { 
        password: name === 'confirmPassword' ? form.password : 
                 name === 'password' ? processedValue : form.password 
      });
      
      setValidationErrors(prev => ({
        ...prev,
        [name]: validationError
      }));
      
      // Also re-validate confirm password if password changed
      if (name === 'password' && fieldTouched.confirmPassword) {
        const confirmError = getValidationError('confirmPassword', form.confirmPassword, { 
          password: processedValue 
        });
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: confirmError
        }));
      }
    }
  }, [form.password, form.confirmPassword, fieldTouched, error]);

  // Handle field blur (when user leaves field)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field
    const validationError = getValidationError(name, value, { password: form.password });
    setValidationErrors(prev => ({
      ...prev,
      [name]: validationError
    }));
  }, [form.password]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Comprehensive form validation before submission
  const validateFormForSubmission = () => {
    const errors = validateForm(form);
    setValidationErrors(errors);
    
    // Mark all fields as touched to show errors
    const allFieldsTouched = {};
    Object.keys(form).forEach(field => {
      allFieldsTouched[field] = true;
    });
    setFieldTouched(allFieldsTouched);
    
    return !hasValidationErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!validateFormForSubmission()) {
      setError("Please fix the validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
<<<<<<< HEAD
      const formData = new FormData();
      
      // Add form fields (excluding confirmPassword as it's not needed by backend)
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'confirmPassword') {
          formData.append(key, value);
        }
      });
      
      if (image) formData.append("profileImage", image);

      const res = await axios.post("http://localhost:5000/api/users/register", formData, {
=======
      const res = await axios.post("https://river-water-management-and-life-safety.onrender.com/api/users/register", formData, {
>>>>>>> 2fbe8132cddf7836b51fa74ad1eed608d9105cd1
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Save token & user in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Navigate based on role
      if (res.data.user.role === "admin") navigate("/admin-panel");
      else if (res.data.user.role === "govt") navigate("/govt-dashboard");
      else navigate("/profile");
      
    } catch (err) {
      console.error("Registration error:", err);
      const serverError = err.response?.data?.message || "Registration failed. Please try again.";
      setError(serverError);
      
      // Map server errors to specific fields if possible
      if (serverError.includes("email")) {
        setValidationErrors(prev => ({
          ...prev,
          email: serverError
        }));
      } else if (serverError.includes("mobile")) {
        setValidationErrors(prev => ({
          ...prev,
          mobile: serverError
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get field error class
  const getFieldClass = (fieldName) => {
    const hasError = fieldTouched[fieldName] && validationErrors[fieldName];
    const isValid = fieldTouched[fieldName] && !validationErrors[fieldName] && form[fieldName];
    
    if (hasError) return 'form-field error';
    if (isValid) return 'form-field valid';
    return 'form-field';
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>
      
      {error && <div className="error-message global-error">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        {/* Name Field */}
        <div className="form-group">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('name')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.name && validationErrors.name && (
            <div className="error-message">{validationErrors.name}</div>
          )}
          {fieldTouched.name && !validationErrors.name && form.name && (
            <div className="success-message">✓ Valid name</div>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('email')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.email && validationErrors.email && (
            <div className="error-message">{validationErrors.email}</div>
          )}
          {fieldTouched.email && !validationErrors.email && form.email && (
            <div className="success-message">✓ Valid email</div>
          )}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <input
            name="password"
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('password')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.password && validationErrors.password && (
            <div className="error-message">{validationErrors.password}</div>
          )}
          
          {/* Password Strength Indicator */}
          <PasswordStrengthIndicator 
            password={form.password} 
            show={showPasswordStrength}
          />
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('confirmPassword')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.confirmPassword && validationErrors.confirmPassword && (
            <div className="error-message">{validationErrors.confirmPassword}</div>
          )}
          {fieldTouched.confirmPassword && !validationErrors.confirmPassword && form.confirmPassword && (
            <div className="success-message">✓ Passwords match</div>
          )}
        </div>

        {/* Mobile Field */}
        <div className="form-group">
          <input
            name="mobile"
            type="tel"
            placeholder="Mobile Number (10 digits)"
            value={form.mobile}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('mobile')}
            disabled={isSubmitting}
            maxLength="10"
            required
          />
          {fieldTouched.mobile && validationErrors.mobile && (
            <div className="error-message">{validationErrors.mobile}</div>
          )}
          {fieldTouched.mobile && !validationErrors.mobile && form.mobile && (
            <div className="success-message">✓ Valid mobile number</div>
          )}
        </div>

        {/* Place Field */}
        <div className="form-group">
          <input
            name="place"
            type="text"
            placeholder="City/Place"
            value={form.place}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('place')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.place && validationErrors.place && (
            <div className="error-message">{validationErrors.place}</div>
          )}
          {fieldTouched.place && !validationErrors.place && form.place && (
            <div className="success-message">✓ Valid place</div>
          )}
        </div>

        {/* State Field */}
        <div className="form-group">
          <input
            name="state"
            type="text"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass('state')}
            disabled={isSubmitting}
            required
          />
          {fieldTouched.state && validationErrors.state && (
            <div className="error-message">{validationErrors.state}</div>
          )}
          {fieldTouched.state && !validationErrors.state && form.state && (
            <div className="success-message">✓ Valid state</div>
          )}
        </div>

        {/* Role Selection */}
        <div className="form-group">
          <select 
            name="role" 
            onChange={handleChange} 
            value={form.role}
            className="form-field"
            disabled={isSubmitting}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="govt">Government Official</option>
          </select>
        </div>

        {/* Profile Image */}
        <div className="form-group">
          <label className="file-input-label">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="file-input"
              disabled={isSubmitting}
            />
            <span className="file-input-text">
              {image ? image.name : "Choose Profile Image (Optional)"}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting || hasValidationErrors(validationErrors)}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
        
        <p className="login-link">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
