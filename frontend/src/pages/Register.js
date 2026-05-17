import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Try a different email.');
        }
    };

    return (
        <div class="auth-container">
            <div class="auth-card">
                <h2 class="auth-title">Create Account</h2>
                <p class="auth-subtitle">Sign up to start sharing files between home and office</p>
                
                {error && <div class="error-banner">{error}</div>}
                
                <form onSubmit={handleRegister} class="auth-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@email.com" required />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" class="auth-btn auth-btn-reg">Sign Up</button>
                </form>
                <p class="auth-footer">
                    Already have an account? <Link to="/login">Log in here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;