import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};

        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            newErrors.fullName = "Full Name must contain only letters.";
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Invalid email format.";
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be 10 digits.";
        }

        if (!/(?=.*[A-Z])(?=.*[\W])(?=.*\d)[A-Za-z\d\W]{8,}$/.test(formData.password)) {
            newErrors.password = "Password must be at least 8 characters, with 1 uppercase, 1 special character, and 1 number.";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleRecaptcha = (value) => {
        setRecaptchaValue(value);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!recaptchaValue) {
            alert("Please verify the reCAPTCHA!");
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            await axios.post("http://localhost:5000/register", {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
            });
            alert("Registration successful");
            navigate("/login");
        } catch (error) {
            alert("User already exists");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Register</h2>
                <form className="signup-form" onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                    {errors.fullName && <p className="error-text">{errors.fullName}</p>}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

                    {/* Google reCAPTCHA */}
                    <div className="recaptcha-container">
                        <ReCAPTCHA
                            sitekey="6LcS1dgqAAAAAF35MuCR273nNw3yVx8f7K6PjgNT"
                            onChange={handleRecaptcha}
                        />
                    </div>

                    <button type="submit" className="signup-btn">Register</button>
                </form>
                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
