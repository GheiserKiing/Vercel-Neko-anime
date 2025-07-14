import React from "react";
import "./Banner.css";

export default function Banner({ src, alt = "" }) {
  return (
    <section className="Banner">
      <img src={src} alt={alt} className="Banner__img" />
    </section>
  );
}
