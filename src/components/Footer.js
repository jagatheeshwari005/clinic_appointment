import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Clinic Appointment & EHR</div>
            <p>Quality care. Easy appointments. Secure digital records.</p>
            <div className="footer-socials">
              <a className="social-btn" href="#" aria-label="Facebook" title="Facebook">f</a>
              <a className="social-btn" href="#" aria-label="Twitter" title="Twitter">t</a>
              <a className="social-btn" href="#" aria-label="LinkedIn" title="LinkedIn">in</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/appointments">Appointments</Link></li>
              <li><Link to="/ehr">EHR</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>📍 City Center, Main Street</li>
              <li>📞 +1 234 567 890</li>
              <li>✉️ contact@clinic.com</li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Get updates about new services and health tips.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2025 Clinic Appointment & EHR</div>
          <div className="legal-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
