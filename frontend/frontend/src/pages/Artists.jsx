import { useEffect, useState } from "react";
import { api, getImageUrl } from "../utils/api";
import "./Artists.css";

const FALLBACK_ARTIST_IMAGE = "https://via.placeholder.com/600x600?text=Artist";

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await api.get("/api/users/artists");
        setArtists(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load artists");
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <section className="artists">
      <div className="artists-header">
        <h1 className="artists-title">
          Our <span>Artists</span>
        </h1>
        <p className="artists-subtitle">
          Meet the creative minds behind our gallery, each with a unique voice
          and visual language.
        </p>
      </div>

      {error ? <p className="artists-status artists-error">{error}</p> : null}
      {loading ? <p className="artists-status">Loading artists...</p> : null}

      {!loading && !error && artists.length === 0 ? (
        <p className="artists-status">No artists available yet.</p>
      ) : null}

      <div className="artists-grid">
        {artists.map((artist) => (
          <div key={artist._id || artist.id} className="artist-card">
            <img
              src={getImageUrl(artist.profileImage) || FALLBACK_ARTIST_IMAGE}
              alt={artist.name || "Artist"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_ARTIST_IMAGE;
              }}
            />
            <div className="artist-info">
              <h3>{artist.name || "Unknown Artist"}</h3>
              <p>{artist.specialty || "Independent Artist"}</p>
              {artist.email ? <small>{artist.email}</small> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Artists;
