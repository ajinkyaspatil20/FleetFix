import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar"; // Importing the Navbar component
import "../styles/dashboard.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
    {
        quote: "FleetFix has saved us thousands in repair costs. Our trucks are now always road-ready!",
        name: "Rahul Mehta",
        position: "Logistics Manager",
    },
    {
        quote: "Since using FleetFix, our fleet downtime has reduced by 30%. It's a game-changer!",
        name: "Priya Sharma",
        position: "Fleet Owner",
    },
    {
        quote: "The AI predictions are spot-on! We get maintenance alerts before issues turn into major breakdowns.",
        name: "Amit Verma",
        position: "Transport Business Owner",
    },
    {
        quote: "With real-time fuel tracking and maintenance suggestions, we’ve improved our overall efficiency.",
        name: "Neha Patel",
        position: "Operations Head",
    },
];

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);

    // Removed authentication check to allow direct access

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="home-container">
            {/* Navbar Component */}
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-text">
                    <h1>FleetFix - AI-Based Predictive Maintenance</h1>
                    <p>Prevent breakdowns, reduce repair costs, and optimize routes with AI-powered fleet maintenance.</p>
                </div>
                <img src="/image.png" alt="Fleet Optimization" className="hero-image" />
            </section>

            {/* Services Section */}
            <section className="services">
                <h2>Our AI-Powered Solutions</h2>
                <div className="service-list">
                    <div className="service-item">
                        <h3>🔧 Predictive Maintenance</h3>
                        <p>AI detects early signs of failure and provides real-time maintenance alerts.</p>
                    </div>
                    <div className="service-item">
                        <h3>🌱 Eco-Friendly Operations</h3>
                        <p>Optimize performance and fuel usage to reduce carbon emissions.</p>
                    </div>
                    <div className="service-item">
                        <h3>📊 Fleet Performance Analytics</h3>
                        <p>Gain deep insights into vehicle usage with AI-powered analytics.</p>
                    </div>
                    <div className="service-item">
                        <h3>📍 Real-Time Tracking & Emergency Garages</h3>
                        <p>Monitor vehicle locations and improve fleet management efficiency.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <h2>What Our Clients Say</h2>
                <div className="testimonial-container">
                    <button onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)} className="testimonial-nav prev">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="testimonial-card">
                        <p className="testimonial-quote">"{testimonials[index].quote}"</p>
                        <h4>- {testimonials[index].name}, {testimonials[index].position}</h4>
                    </div>
                    <button onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)} className="testimonial-nav next">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="footer">
                <p>&copy; 2025 FleetFix. All rights reserved.</p>
                <p>Contact: support@fleetfix.com | +91 9696XXXXXX</p>
            </footer>
        </div>
    );
};

export default Dashboard;
