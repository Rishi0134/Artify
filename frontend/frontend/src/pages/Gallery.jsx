import { useEffect, useState } from "react";
import { api, getImageUrl } from "../utils/api";
import "./Gallery.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/600x600?text=Artwork";

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await api.get("/api/artworks?limit=100");
        setArtworks(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load gallery");
      }
    };

    fetchArtworks();
  }, []);

  return (
    <section className="gallery">
      <h1 className="gallery-title">Art Collection</h1>
      {error ? <p>{error}</p> : null}

      <div className="gallery-grid">
        {artworks.length === 0 ? <p>No artworks available yet.</p> : null}
        {artworks.map((art) => (
          <div key={art._id} className="gallery-card">
            <img
              src={getImageUrl(art.image) || FALLBACK_ARTWORK_IMAGE}
              alt={art.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
              }}
            />
            <div className="overlay">
              <h3>{art.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
