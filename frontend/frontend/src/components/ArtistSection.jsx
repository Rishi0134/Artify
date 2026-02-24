import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./ArtistSection.css";

const artists = [
  {
    id: 1,
    name: "Madhvi Tandel",
    specialty: "Abstract Expressionism",
    bio: "Layered textures and bold color rhythm.",
    experience: "12+ Years",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200",
  },
  {
    id: 2,
    name: "Aarav Mehta",
    specialty: "Contemporary Minimalism",
    bio: "Geometric balance and calm visual narratives.",
    experience: "9+ Years",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200",
  },
  {
    id: 3,
    name: "Simran Shah",
    specialty: "Modern Figurative Art",
    bio: "Blends realism with modern brushwork.",
    experience: "10+ Years",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
  },
  {
    id: 4,
    name: "Rohan Desai",
    specialty: "Surrealism",
    bio: "Dreamlike narratives with symbolic forms.",
    experience: "8+ Years",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200",
  },
  {
    id: 5,
    name: "Meera Kapoor",
    specialty: "Landscape Art",
    bio: "Nature scenes with atmospheric color depth.",
    experience: "11+ Years",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200",
  },
  {
    id: 6,
    name: "Ishita Verma",
    specialty: "Contemporary Art",
    bio: "Urban themes and expressive mixed media.",
    experience: "7+ Years",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200",
  },
];

const ArtistSection = () => {
  return (
    <section className="home-artist-section">
      <motion.h2
        className="home-artist-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Meet Our Artists
      </motion.h2>

      <div className="home-artist-grid">
        {artists.map((artist, index) => (
          <motion.article
            key={artist.id}
            className="home-artist-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            viewport={{ once: true }}
          >
            <Link to="/artists" className="home-artist-link">
              <img
                src={artist.image}
                alt={artist.name}
                className="home-artist-photo"
              />
            </Link>
            <h3>{artist.name}</h3>
            <p className="home-artist-specialty">{artist.specialty}</p>
            <p className="home-artist-bio">{artist.bio}</p>
            <span className="home-artist-exp">Experience: {artist.experience}</span>
          </motion.article>
        ))}
      </div>

      <div className="home-artist-cta-wrap">
        <Link to="/artists" className="home-artist-profile-btn">
          View More Artists
        </Link>
      </div>
    </section>
  );
};

export default ArtistSection;
