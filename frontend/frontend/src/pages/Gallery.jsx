import { useMemo, useState } from "react";
import "./Gallery.css";

const artworks = [
  {
    id: 1,
    title: "Sunset Valley",
    style: "Landscape",
    image: "/Images/art1.jpg",
  },
  {
    id: 2,
    title: "Golden Meadow",
    style: "Landscape",
    image: "/Images/art2.jpg",
  },
  {
    id: 3,
    title: "Urban Echo",
    style: "Abstract",
    image: "/Images/art3.jpg",
  },
  {
    id: 4,
    title: "Rustic Streets",
    style: "Modern",
    image: "/Images/art4.jpg",
  },
  {
    id: 5,
    title: "Horse Study",
    style: "Realism",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988f1?q=80&w=1400",
  },
  {
    id: 6,
    title: "Chromatic Motion",
    style: "Abstract",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1400",
  },
  {
    id: 7,
    title: "Mountain Silence",
    style: "Landscape",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400",
  },
  {
    id: 8,
    title: "City Rhythm",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1400",
  },
];

const styleFilters = ["All", "Landscape", "Abstract", "Modern", "Realism"];

const Gallery = () => {
  const [selectedStyle, setSelectedStyle] = useState("All");

  const filteredArtworks = useMemo(() => {
    if (selectedStyle === "All") return artworks;
    return artworks.filter((art) => art.style === selectedStyle);
  }, [selectedStyle]);

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

      <div className="gallery-layout">
        <aside className="gallery-filters">
          <h2>Filter By Style</h2>
          <div className="filter-list">
            {styleFilters.map((style) => (
              <button
                key={style}
                className={`filter-btn ${
                  selectedStyle === style ? "active" : ""
                }`}
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </aside>

        <div className="gallery-content">
          <div className="gallery-grid">
            {filteredArtworks.map((art) => (
              <div key={art.id} className="gallery-card">
                <img src={art.image} alt={art.title} />
                <div className="overlay">
                  <h3>{art.title}</h3>
                  <p>{art.style}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <p className="empty-text">No artworks found for this style.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
