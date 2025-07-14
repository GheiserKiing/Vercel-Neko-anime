// File: frontend/src/components/blocks/BlockRenderer.js
import React from "react";
import HeroBlock from "./HeroBlock";
import TextBlock from "./TextBlock";
import ProductBlock from "./ProductBlock";

export default function BlockRenderer({ blocks }) {
  // blocks es un array con objetos { id, type, data }
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "hero":
            return (
              <HeroBlock
                key={block.id}
                id={block.id} // este cambio es para pasar el id al componente HeroBlock si lo necesita
                data={block.data} // este cambio es para pasar la data
              />
            );
          case "text":
            return (
              <TextBlock
                key={block.id}
                id={block.id} // este cambio es para pasar el id al componente TextBlock
                data={block.data}
              />
            );
          case "product":
            return (
              <ProductBlock
                key={block.id}
                id={block.id} // este cambio es para que ProductBlock reciba el id correctamente
                data={block.data} // este cambio es para pasar la data
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
