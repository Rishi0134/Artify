import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Featured.css";

const artworks = [
  {
    id: 1,
    title: "Abstract Harmony",
    artist: "Madhvi Tandel",
    image: "/Images/art3.jpg",
  },
  {
    id: 2,
    title: "Golden Silence",
    artist: "Aarav Mehta",
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=1200",
  },
  {
    id: 3,
    title: "Urban Emotion",
    artist: "Simran Shah",
    image:
      "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?q=80&w=1200",
  },
  {
    id: 4,
    title: "Echoes of Light",
    artist: "Meera Kapoor",
    image: "/Images/art1.jpg",
  },
  {
    id: 5,
    title: "Silent Geometry",
    artist: "Rohan Desai",
    image: "/Images/art2.jpg",
  },
  {
    id: 6,
    title: "City Fragments",
    artist: "Ishita Verma",
    image: "/Images/art4.jpg",
  },
];

const Featured = () => {
  return (
    <section className="featured" id="featured-artworks">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Featured Artworks
      </motion.h2>

      <div className="featured-grid">
        {artworks.map((art, index) => (
          <motion.div
            key={art.id}
            className="art-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            <Link to="/gallery" className="art-link">
              <img src={art.image} alt={art.title} />
              <div className="art-overlay">
                <h3>{art.title}</h3>
                <p>{art.artist}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="featured-cta-wrap">
        <Link to="/gallery" className="featured-cta-btn">
          View More Artworks
        </Link>
      </div>
    </section>
  );
};

export default Featured;
