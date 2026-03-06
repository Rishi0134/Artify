import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import { getImageUrl } from "../utils/api";
import { shopApi } from "../utils/shopApi";
import "./Shop.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/600x600?text=Artwork";

const ArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = getStoredUser();
  const canShop = user && ["user", "customer"].includes(user.role);

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        setLoading(true);
        const response = await shopApi.artworkDetails(id);
        setArtwork(response.data || null);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };

    loadArtwork();
  }, [id]);

  const handleAddToCart = async () => {
    if (!canShop) {
      navigate("/login");
      return;
    }

    try {
      setMessage("");
      await shopApi.addToCart(id, 1);
      setMessage("Added to cart");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <section className="shop-page"><p>Loading artwork...</p></section>;
  }

  if (!artwork) {
    return <section className="shop-page"><p>{error || "Artwork not found"}</p></section>;
  }

  return (
    <section className="shop-page">
      <div className="details-grid">
        <img
          className="details-image"
          src={getImageUrl(artwork.image) || FALLBACK_ARTWORK_IMAGE}
          alt={artwork.title || "Artwork"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
          }}
        />
        <div className="details-content">
          <h1>{artwork.title}</h1>
          <p className="shop-muted">{artwork.description || "No description available"}</p>
          <p>Category: {artwork.category || "General"}</p>
          <p>Artist: {artwork.artist?.name || "Unknown artist"}</p>
          <p className="shop-price">Rs. {artwork.price}</p>

          {error && <p className="shop-error">{error}</p>}
          {message && <p className="shop-success">{message}</p>}

          <div className="shop-actions">
            <button type="button" onClick={handleAddToCart}>
              Add To Cart
            </button>
            <Link to="/cart" className="shop-link-btn">View Cart</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtworkDetails;
