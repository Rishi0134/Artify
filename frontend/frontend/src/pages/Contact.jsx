// import "./Contact.css";

// const Contact = () => {
//   return (
//     <section className="contact">
//       {/* Hero Section */}
//       <div className="contact-hero">
//         <h1>Contact Us</h1>
//         <p>
//           Have questions, collaborations, or inquiries? We'd love to hear from you.
//         </p>
//       </div>

//       {/* Contact Form + Info */}
//       <div className="contact-container">
//         <form className="contact-form">
//           <input type="text" placeholder="Your Name" required />
//           <input type="email" placeholder="Your Email" required />
//           <textarea placeholder="Your Message" rows="6" required />
//           <button type="submit">Send Message</button>
//         </form>

//         <div className="contact-info">
//           <h3>Get in Touch</h3>
//           <p><strong>Email:</strong> support@artify.com</p>
//           <p><strong>Phone:</strong> +91 98765 43210</p>
//           <p><strong>Location:</strong> Mumbai, India</p>
//         </div>
//       </div>

//       {/* Google Map Section */}
//       <div className="map-section">
//         <h2>Our Location</h2>
//         <div className="map-container">
//           <iframe
//             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.444555214173!2d72.8776553748599!3d19.07609008213001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63a3f8f9f0d%3A0x9c0b9c4f07c2e9c2!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
//             width="100%"
//             height="400"
//             style={{ border: 0 }}
//             allowFullScreen=""
//             loading="lazy"
//           ></iframe>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Contact;  

import "./Contact.css";

const Contact = () => {
  return (
    <section className="contact">

      {/* Hero Section */}
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Have questions, collaborations, or inquiries? We'd love to hear from you.
        </p>
      </div>

      {/* Horizontal Info Section */}
      <div className="contact-top-section">

        {/* Get in Touch */}
        <div className="contact-info">
  <h3>Get in Touch</h3>

  <p>
    We'd love to connect with artists, collectors, and collaborators.
    Reach out to us for partnerships, artwork submissions, or any inquiries.
  </p>

  <div className="contact-detail">
    <p><strong>Email:</strong> support@artify.com</p>
    <p><strong>Phone:</strong> +91 98765 43210</p>
    <p><strong>Location:</strong> Mumbai, India</p>
    <p><strong>Working Hours:</strong> Mon – Sat, 10:00 AM – 7:00 PM</p>
  </div>
</div>

        {/* Our Location */}
        <div className="map-section">
          <h3>Our Location</h3>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.444555214173!2d72.8776553748599!3d19.07609008213001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63a3f8f9f0d%3A0x9c0b9c4f07c2e9c2!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </div>

      {/* Contact Form Below */}
      <div className="contact-form-wrapper">
        <form className="contact-form">
          <h3>Send Message</h3>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="6" required />
          <button type="submit">Send Message</button>
        </form>
      </div>

    </section>
  );
};

export default Contact;