import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    Star,
    ArrowRight,
    Zap,
    Shield,
    BarChart3,
    QrCode,
    Sparkles
} from "lucide-react";
import "../styles/home.css";

export default function Home() {
    const { firebaseUser, loading } = useAuth();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="home-page-container">
            {/* Background Effects */}
            <div className="home-bg-glow">
                <div className="glow-orb glow-orb-1"></div>
                <div className="glow-orb glow-orb-2"></div>
            </div>

            {/* Navigation */}
            <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="home-nav-container">
                    <Link to="/" className="home-logo">
                        <Star className="home-logo-icon" fill="currentColor" />
                        <span>ReviewFlow</span>
                    </Link>
                    <div className="home-nav-actions">
                        {!loading && (
                            firebaseUser ? (
                                <Link to="/dashboard" className="home-btn home-btn-primary">
                                    Dashboard <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="home-link">Sign In</Link>
                                    <Link to="/login" className="home-btn home-btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero-grid">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        style={{ opacity, y }}
                    >
                        <motion.div variants={fadeIn} className="home-badge">
                            <span className="home-badge-dot"></span>
                            Powered by Next-Gen AI
                        </motion.div>
                        
                        <motion.h1 variants={fadeIn} className="home-title">
                            Turn Every <span className="home-text-gradient">Review</span> <br />
                            Into a Growth Engine
                        </motion.h1>
                        
                        <motion.p variants={fadeIn} className="home-subtitle">
                            Collect local reviews effortlessly. Use AI to generate high-converting responses and display branded QR codes that customers actually want to scan.
                        </motion.p>
                        
                        <motion.div variants={fadeIn} className="home-hero-actions">
                            <Link to="/login" className="home-btn home-btn-primary">
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <a href="#features" className="home-btn home-btn-outline">
                                Explore Features
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visuals (Generated Image + Floating Preview) */}
                    <motion.div 
                        className="home-hero-visuals"
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.3, type: "spring" }}
                    >
                        <img 
                            src="/hero-illustration.png" 
                            alt="Premium 3D Abstract Illustration" 
                            className="home-hero-image"
                        />
                        
                        <motion.div 
                            className="home-preview-card"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <div className="home-preview-header">
                                <div className="home-preview-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="home-preview-url">reviewflow.ai/your-business</div>
                            </div>
                            <div className="home-preview-content">
                                <div className="home-preview-stars">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
                                </div>
                                <div style={{ height: '10px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginTop: '0.5rem' }}></div>
                                <div style={{ height: '8px', width: '80%', background: '#f1f5f9', borderRadius: '4px' }}></div>
                                <div style={{ height: '8px', width: '40%', background: '#f1f5f9', borderRadius: '4px' }}></div>
                                
                                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.875rem', fontWeight: 700 }}>
                                    <Sparkles size={16} /> AI Response Generated
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="home-stats">
                <motion.div 
                    className="home-stats-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeIn}>
                        <div className="home-stat-number">88%</div>
                        <div className="home-stat-label">Trust online reviews as much as personal recommendations</div>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <div className="home-stat-number">4.2x</div>
                        <div className="home-stat-label">Higher conversion rates for businesses with detailed reviews</div>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <div className="home-stat-number">2min</div>
                        <div className="home-stat-label">To set up your branded collection page and QR codes</div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="home-features">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <h2 className="home-section-title">Everything you need to <span className="home-text-gradient">dominate</span></h2>
                    <p className="home-section-subtitle">Stop losing customers to bad reviews. Take control of your online reputation with our suite of powerful tools.</p>
                </motion.div>

                <div className="bento-grid">
                    <motion.div 
                        className="bento-card bento-wide"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bento-icon icon-purple"><Zap /></div>
                        <h3>AI Review Assistant</h3>
                        <p>Generate personalized, high-quality review responses using state-of-the-art AI. Turn negative feedback into positive opportunities and save hours of manual typing.</p>
                    </motion.div>

                    <motion.div 
                        className="bento-card bento-square"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bento-icon icon-blue"><QrCode /></div>
                        <h3>Branded QR Codes</h3>
                        <p>Display custom, high-resolution QR codes. Scan, review, and grow instantly.</p>
                    </motion.div>

                    <motion.div 
                        className="bento-card bento-square"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="bento-icon icon-green"><BarChart3 /></div>
                        <h3>Advanced Analytics</h3>
                        <p>Track your growth, monitor review trends, and understand your customers.</p>
                    </motion.div>

                    <motion.div 
                        className="bento-card bento-wide"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="bento-icon icon-pink"><Shield /></div>
                        <h3>Brand Security & Multi-Location</h3>
                        <p>Manage multiple locations from a single dashboard. Keep your brand voice consistent everywhere while empowering local managers to handle their own customer interactions.</p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="home-cta">
                <motion.div 
                    className="home-cta-inner"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2>Ready to skyrocket your brand?</h2>
                    <p>Join hundreds of local businesses using ReviewFlow to dominate their local search results.</p>
                    <Link to="/login" className="home-btn home-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Get Started Now <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-grid">
                    <div className="home-footer-brand">
                        <Link to="/" className="home-logo">
                            <Star className="home-logo-icon" fill="currentColor" />
                            <span>ReviewFlow</span>
                        </Link>
                        <p>Better reviews. Faster growth. The modern way to manage your local business reputation.</p>
                    </div>
                    <div className="home-footer-links">
                        <h4>Product</h4>
                        <Link to="/login">Login</Link>
                        <Link to="/login">Register</Link>
                        <a href="#features">Features</a>
                    </div>
                    <div className="home-footer-links">
                        <h4>Company</h4>
                        <a href="#">About</a>
                        <Link to="/privacy">Privacy</Link>
                        <a href="#">Terms</a>
                    </div>
                </div>
                <div className="home-footer-bottom">
                    <p>&copy; 2026 ReviewFlow Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
