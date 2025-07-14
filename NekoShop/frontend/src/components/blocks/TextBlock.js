import React from "react";

export default function TextBlock({ data }) {
  // data: { text }
  return (
    <section style={styles.textSection}>
      <p style={styles.paragraph}>{data.text}</p>
    </section>
  );
}

const styles = {
  textSection: {
    padding: "20px",
    marginBottom: "30px",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#333",
  },
};
