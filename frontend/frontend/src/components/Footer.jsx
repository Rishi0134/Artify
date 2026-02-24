import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Artify Gallery</h3>
          <p>
            Discover timeless and modern artworks in a curated virtual
            experience.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/artists">Artists</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: hello@artifygallery.com</p>
          <p>Phone: +1 (555) 342-7788</p>
          <p>Location: New York, USA</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} Artify Gallery. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
