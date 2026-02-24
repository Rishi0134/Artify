import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./ArtistSection.css";

const artists = [
  {
    id: 1,
    name: "Madhvi Tandel",
    specialty: "Abstract Expressionism",
    bio: "Known for layered textures and bold color rhythm that explores human emotion through movement.",
    experience: "12+ Years",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200",
  },
  {
    id: 2,
    name: "Aarav Mehta",
    specialty: "Contemporary Minimalism",
    bio: "Creates quiet visual narratives with geometric balance and subtle palettes inspired by urban silence.",
    experience: "9+ Years",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200",
  },
  {
    id: 3,
    name: "Simran Shah",
    specialty: "Modern Figurative Art",
    bio: "Blends realism and modern brushwork to portray identity, memory, and city life in evolving forms.",
    experience: "10+ Years",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
  },
];

const ArtistSection = () => {
  return (
    <section className="artist-section">
      <motion.h2
        className="artist-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Meet Our Artists
      </motion.h2>

      <div className="artist-grid">
        {artists.map((artist, index) => (
          <motion.article
            key={artist.id}
            className="artist-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            <Link to="/artists" className="artist-link">
              <img src={artist.image} alt={artist.name} className="artist-photo" />
            </Link>
            <h3>{artist.name}</h3>
            <p className="artist-specialty">{artist.specialty}</p>
            <p className="artist-bio">{artist.bio}</p>
            <span className="artist-exp">Experience: {artist.experience}</span>
            <Link to="/artists" className="artist-profile-btn">
              View Profile
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default ArtistSection;
