import { useEffect, useState } from "react";
import { api, getImageUrl } from "../utils/api";
import "./Artists.css";

const FALLBACK_ARTIST_IMAGE = "https://via.placeholder.com/600x600?text=Artist";

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await api.get("/api/users/artists");
        setArtists(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load artists");
      }
    };

    fetchArtists();
  }, []);

  return (
    <section className="artists">
      <h1 className="artists-title">Our Artists</h1>

      {error ? <p className="artists-error">{error}</p> : null}

      <div className="artists-grid">
        {artists.length === 0 ? <p>No artists available yet.</p> : null}
        {artists.map((artist) => (
          <div key={artist._id} className="artist-card">
            <img
              src={getImageUrl(artist.profileImage) || FALLBACK_ARTIST_IMAGE}
              alt={artist.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_ARTIST_IMAGE;
              }}
            />
            <div className="artist-info">
              <h3>{artist.name}</h3>
              <p>{artist.specialty || "Independent Artist"}</p>
              <small>{artist.email}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Artists;
