import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getImageUrl } from "../utils/api";
import { getStoredUser } from "../utils/auth";
import { shopApi } from "../utils/shopApi";
import "./Gallery.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/600x600?text=Artwork";

const getArtStyle = (art) => art?.style || art?.category || "Uncategorized";

const Gallery = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const canShop = user && ["user", "customer"].includes(user.role);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await api.get("/api/artworks?limit=100");
        setArtworks(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const styleFilters = useMemo(() => {
    const unique = new Set(artworks.map((art) => getArtStyle(art)));
    return ["All", ...unique];
  }, [artworks]);

  const filteredArtworks = useMemo(() => {
    if (selectedStyle === "All") return artworks;
    return artworks.filter((art) => getArtStyle(art) === selectedStyle);
  }, [artworks, selectedStyle]);

  const handleAddToCart = async (artworkId) => {
    if (!canShop) {
      navigate("/login");
      return;
    }

    try {
      await shopApi.addToCart(artworkId, 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <section className="gallery">
      <div className="gallery-header">
        <h1 className="gallery-title">
          Art <span>Collection</span>
        </h1>
        <p className="gallery-subtitle">
          Explore styles, discover pieces you love, and curate your favorite
          visual journey.
        </p>
      </div>

      {error ? <p className="empty-text">{error}</p> : null}

      <div className="gallery-layout">
        <aside className="gallery-filters">
          <h2>Filter By Style</h2>
          <div className="filter-list">
            {styleFilters.map((style) => (
              <button
                key={style}
                className={`filter-btn ${selectedStyle === style ? "active" : ""}`}
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </aside>

        <div className="gallery-content">
          {loading ? <p className="empty-text">Loading artworks...</p> : null}

          <div className="gallery-grid">
            {filteredArtworks.map((art) => (
              <div key={art._id || art.id} className="gallery-card">
                <Link to={`/gallery/${art._id || art.id}`}>
                  <img
                    src={getImageUrl(art.image) || FALLBACK_ARTWORK_IMAGE}
                    alt={art.title || "Artwork"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
                    }}
                  />
                </Link>
                <div className="overlay">
                  <h3>{art.title || "Untitled"}</h3>
                  <p>{getArtStyle(art)}</p>
                  <button
                    type="button"
                    className="gallery-cart-btn"
                    onClick={() => handleAddToCart(art._id || art.id)}
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredArtworks.length === 0 ? (
            <p className="empty-text">No artworks found for this style.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
