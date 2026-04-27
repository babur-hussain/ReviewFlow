import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Star,
    ArrowRight,
    Zap,
    Shield,
    BarChart3,
    CheckCircle2,
    Users,
    MessageSquare,
    QrCode
} from "lucide-react";

export default function Home() {
    const { firebaseUser, loading } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="nav-blur sticky-nav">
                <div className="container nav-container">
                    <div className="logo-group">
                        <div className="logo-icon">
                            <Star fill="currentColor" />
                        </div>
                        <span className="logo-text">ReviewFlow</span>
                    </div>
                    <div className="nav-actions">
                        {!loading && (
                            firebaseUser ? (
                                <Link to="/dashboard" className="btn btn-primary btn-sm">
                                    Go to Dashboard <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="nav-link">Sign In</Link>
                                    <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-badge">
                        <span className="pulse-dot"></span>
                        Powered by Claude 3.5 Sonnet
                    </div>
                    <h1 className="hero-title">
                        Turn Every <span className="text-gradient">Review</span> <br />
                        Into a Growth Engine
                    </h1>
                    <p className="hero-subtitle">
                        Collect local reviews effortlessly. Use AI to generate high-converting responses and display branded QR codes that customers actually want to scan.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Start Free Trial <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className="btn btn-outline btn-lg">
                            Explore Features
                        </a>
                    </div>

                    {/* Hero Preview */}
                    <div className="hero-preview-container">
                        <div className="preview-card glass">
                            <div className="preview-header">
                                <div className="preview-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="preview-url">reviewflow.ai/kapoor-sons</div>
                            </div>
                            <div className="preview-body">
                                <div className="preview-review">
                                    <div className="preview-stars">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" className="text-warning" />)}
                                    </div>
                                    <div className="preview-skeleton-title"></div>
                                    <div className="preview-skeleton-text"></div>
                                    <div className="preview-skeleton-text short"></div>
                                </div>
                                <div className="preview-ai-badge">AI Assistant Generated</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container stats-grid">
                    <div className="stat-item">
                        <h3>88%</h3>
                        <p>Trust online reviews as much as personal recommendations.</p>
                    </div>
                    <div className="stat-item border-x">
                        <h3>4.2x</h3>
                        <p>Higher conversion rates for businesses with detailed reviews.</p>
                    </div>
                    <div className="stat-item">
                        <h3>2min</h3>
                        <p>Set up your branded collection page in under two minutes.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Everything you need to <span className="text-gradient">succeed</span></h2>
                        <p className="section-desc">Stop losing customers to bad reviews. Take control of your online reputation today.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card glass-hover">
                            <div className="feature-icon bg-soft-blue">
                                <Zap size={24} />
                            </div>
                            <h3>AI Review Assistant</h3>
                            <p>Generate personalized, high-quality reviews for your customers using state-of-the-art AI. No more writer's block.</p>
                        </div>

                        <div className="feature-card glass-hover">
                            <div className="feature-icon bg-soft-purple">
                                <QrCode size={24} />
                            </div>
                            <h3>Branded QR Codes</h3>
                            <p>Display custom, high-resolution QR codes at your place of business. Scan, review, and grow instantly.</p>
                        </div>

                        <div className="feature-card glass-hover">
                            <div className="feature-icon bg-soft-green">
                                <BarChart3 size={24} />
                            </div>
                            <h3>Advanced Analytics</h3>
                            <p>Track your growth, monitor review trends, and understand your customers via our intuitive dashboard.</p>
                        </div>

                        <div className="feature-card glass-hover">
                            <div className="feature-icon bg-soft-orange">
                                <Shield size={24} />
                            </div>
                            <h3>Brand Security</h3>
                            <p>Manage multiple locations from a single dashboard. Keep your brand voice consistent everywhere.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container cta-container glass">
                    <div className="cta-content">
                        <h2>Ready to skyrocket your brand?</h2>
                        <p>Join hundreds of local businesses using ReviewFlow to dominate their local search results.</p>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Get Started Now <ArrowRight size={20} />
                        </Link>
                    </div>
                    <div className="cta-image">
                        <div className="cta-blob"></div>
                        <Users size={64} className="cta-icon" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="logo-group">
                            <Star fill="currentColor" size={20} />
                            <span className="logo-text">ReviewFlow</span>
                        </div>
                        <p>Better reviews. Faster growth.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Product</h4>
                        <Link to="/login">Login</Link>
                        <Link to="/login">Register</Link>
                        <a href="#features">Features</a>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <a href="#">About</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <p>&copy; 2026 ReviewFlow Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
