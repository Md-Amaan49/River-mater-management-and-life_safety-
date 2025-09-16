// frontend/src/pages/Contact.jsx
import React, { useState } from "react";
import "../styles/Contact.css";
import Sidebar from "../components/Sidebar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully ✅");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
     
      <div className="contact-content">
        <h1>Contact Us</h1>
        <p>
          Have questions, suggestions, or feedback? Reach out to us using the
          form below.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Send Message</button>
        </form>

        <div className="contact-info">
          <h2>📍 Our Office</h2>
          <p>123 Water Safety Street, Hydrotech City</p>

          <h2>📞 Phone</h2>
          <p>+91 98765 43210</p>

          <h2>📧 Email</h2>
          <p>support@riversafety.com</p>
        </div>
      </div>
    </div>
  );
}
