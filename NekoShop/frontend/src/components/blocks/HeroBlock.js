import React from "react";

export default function HeroBlock({ data }) {
  // data: { title, subtitle, imageUrl }
  return (
    <section style={styles.heroSection}>
      <img src={data.imageUrl} alt={data.title} style={styles.heroImage} />
      <div style={styles.textContainer}>
        <h2 style={styles.title}>{data.title}</h2>
        <p style={styles.subtitle}>{data.subtitle}</p>
      </div>
    </section>
  );
}

const styles = {
  heroSection: {
    position: "relative",
    textAlign: "center",
    color: "#fff",
    marginBottom: "40px",
  },
  heroImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    opacity: 0.8,
  },
  textContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  title: {
    fontSize: "36px",
    margin: 0,
  },
  subtitle: {
    fontSize: "18px",
    marginTop: "10px",
  },
};
