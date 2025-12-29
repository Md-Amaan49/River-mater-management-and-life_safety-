import React from 'react';
import { calculatePasswordStrength } from '../utils/ValidationUtils';
import '../styles/PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password, show = true }) => {
  if (!show || !password) {
    return null;
  }

  const strength = calculatePasswordStrength(password);
  const { score, feedback, color, label } = strength;

  // Calculate percentage for progress bar
  const percentage = (score / 4) * 100;

  return (
    <div className="password-strength-indicator">
      <div className="strength-meter">
        <div className="strength-label">
          <span className="strength-text">Password Strength: </span>
          <span className={`strength-level strength-${color}`}>{label}</span>
        </div>
        <div className="strength-bar">
          <div 
            className={`strength-progress strength-progress-${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {feedback && feedback.length > 0 && (
        <div className="strength-feedback">
          <ul className="feedback-list">
            {feedback.map((message, index) => (
              <li key={index} className={`feedback-item feedback-${color}`}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;