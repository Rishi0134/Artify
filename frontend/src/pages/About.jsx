import { useEffect, useRef, useState } from "react";
import "./About.css";

const AnimatedCounter = ({ end, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated, end, duration]);

  return (
    <h3 ref={counterRef}>
      {count}
      {suffix}
    </h3>
  );
};

const About = () => {
  return (
    <section className="about">
      <div className="about-hero">
        <h1>
          About <span>Artify</span>
        </h1>
        <p>
          Artify is a premium virtual art gallery showcasing curated artworks
          from talented artists across the world.
        </p>
      </div>

      <div className="about-content">
        <div className="about-text card">
          <h2>Our Vision</h2>
          <p>
            We believe art should be accessible, immersive, and inspiring.
            Artify bridges the gap between artists and art lovers through
            a modern digital experience.
          </p>

          <h2>Our Mission</h2>
          <p>
            To empower emerging artists and provide collectors with a curated,
            elegant platform to explore timeless masterpieces.
          </p>
        </div>

        <div className="about-image card">
          <img
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f"
            alt="Art Gallery"
          />
        </div>
      </div>

      <div className="about-stats card">
        <div className="stat">
          <AnimatedCounter end={500} suffix="+" />
          <p>Artworks</p>
        </div>
        <div className="stat">
          <AnimatedCounter end={120} suffix="+" />
          <p>Artists</p>
        </div>
        <div className="stat">
          <AnimatedCounter end={10} suffix="K+" />
          <p>Visitors</p>
        </div>
      </div>
    </section>
  );
};

export default About;
