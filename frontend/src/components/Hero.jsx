import { motion } from "framer-motion";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import "./Hero.css";

const Hero = () => {
  const handleExploreClick = () => {
    const featuredSection = document.getElementById("featured-artworks");
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="hero">
      <div className="overlay" />

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Discover Timeless
          <span> Art Masterpieces</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Explore curated artworks from talented artists around the world.
        </motion.p>

        <motion.button
          className="hero-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExploreClick}
        >
          Explore Collection
        </motion.button>

        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDownIcon className="arrow" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
