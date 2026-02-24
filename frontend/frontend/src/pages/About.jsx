// import "./About.css";

// const About = () => {
//   return (
//     <section className="about">
//       <div className="about-hero">
//         <h1>About Artify</h1>
//         <p>
//           Artify is a premium virtual art gallery showcasing curated artworks
//           from talented artists across the world.
//         </p>
//       </div>

//       <div className="about-content">
//         <div className="about-text">
//           <h2>Our Vision</h2>
//           <p>
//             We believe art should be accessible, immersive, and inspiring.
//             Artify bridges the gap between artists and art lovers through
//             a modern digital experience.
//           </p>

//           <h2>Our Mission</h2>
//           <p>
//             To empower emerging artists and provide collectors with a curated,
//             elegant platform to explore timeless masterpieces.
//           </p>
//         </div>

//         <div className="about-image">
//           <img
//             src="https://images.unsplash.com/photo-1513364776144-60967b0f800f"
//             alt="Art Gallery"
//           />
//         </div>
//       </div>

//       <div className="about-stats">
//         <div className="stat">
//           <h3>500+</h3>
//           <p>Artworks</p>
//         </div>
//         <div className="stat">
//           <h3>120+</h3>
//           <p>Artists</p>
//         </div>
//         <div className="stat">
//           <h3>10K+</h3>
//           <p>Visitors</p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default About;

import "./About.css";

const About = () => {
  return (
    <section className="about">

      {/* Hero Section */}
      <div className="about-hero">
        <h1>About <span>Artify</span></h1>
        <p>
          Artify is a premium virtual art gallery showcasing curated artworks
          from talented artists across the world.
        </p>
      </div>

      {/* Content Section */}
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

      {/* Stats Section */}
      <div className="about-stats card">
        <div className="stat">
          <h3>500+</h3>
          <p>Artworks</p>
        </div>
        <div className="stat">
          <h3>120+</h3>
          <p>Artists</p>
        </div>
        <div className="stat">
          <h3>10K+</h3>
          <p>Visitors</p>
        </div>
      </div>

    </section>
  );
};

export default About;