import { Link } from "react-router-dom";
import "./CreateAccountBanner.css";

const CreateAccountBanner = () => {
  return (
    <section className="create-account-banner">
      <div className="create-account-card">
        <div className="create-account-decor" aria-hidden="true">
          <span className="glow glow-one" />
          <span className="glow glow-two" />
        </div>

        <div className="create-account-content">
          <h2>Join 1000+ Art Lovers And Collectors</h2>
          <p>
            Create your account to save favorites, follow artists, and explore
            exclusive gallery drops.
          </p>

          <div className="create-account-tags" aria-hidden="true">
            <span>Weekly Drops</span>
            <span>Verified Artists</span>
            <span>Private Collections</span>
          </div>

          <Link to="/login" className="create-account-btn">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CreateAccountBanner;
