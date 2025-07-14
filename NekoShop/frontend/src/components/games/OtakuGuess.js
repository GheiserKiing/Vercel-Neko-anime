// File: frontend/src/components/games/OtakuGuess.js
import React, { useState, useEffect } from "react";
import "./OtakuGuess.css";

const PERSONAJES = [
  { name: "NARUTO", anime: "Naruto" },
  { name: "GOKU", anime: "Dragon Ball" },
  { name: "LUFFY", anime: "One Piece" },
  { name: "ITACHI", anime: "Naruto" },
  { name: "ZORO", anime: "One Piece" },
  { name: "SASUKE", anime: "Naruto" },
  { name: "DEKU", anime: "My Hero Academia" },
  { name: "SATORU", anime: "Jujutsu Kaisen" },
  { name: "ALLMIGHT", anime: "My Hero Academia" },
];

export default function OtakuGuess() {
  const MAX_INTENTOS = 9;
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = "otakuGuessRecord";

  const [solucion, setSolucion] = useState({ name: "", anime: "" });
  const [intentos, setIntentos] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [message, setMessage] = useState("");
  const [playedToday, setPlayedToday] = useState(false);
  const [record, setRecord] = useState(null);

  // Cargar registro y bloquear si ya jugado
  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem(storageKey) || "{}");
    setRecord(rec);
    if (rec.date === today) {
      setPlayedToday(true); // este cambio es para impedir jugar más de una vez al día
      setSolucion({ name: rec.solution, anime: rec.anime });
      setMessage(
        rec.win
          ? `🎉 Ayer acertaste ${rec.solution}! Vuelve mañana.`
          : `❌ Ayer no acertaste (${rec.solution}). Vuelve mañana.`,
      );
    }
  }, []);

  // Elegir personaje del día
  useEffect(() => {
    if (!playedToday) {
      const idx = parseInt(today.replace(/-/g, ""), 10) % PERSONAJES.length;
      setSolucion(PERSONAJES[idx]);
    }
  }, [playedToday]);

  function handleSubmit(e) {
    e.preventDefault();
    const guess = entrada.toUpperCase().trim();
    if (guess.length !== solucion.name.length) {
      setMessage(`Debe tener ${solucion.name.length} letras`);
      return;
    }
    // conteo de letras
    const counts = {};
    solucion.name.split("").forEach((c) => (counts[c] = (counts[c] || 0) + 1));
    const feedback = Array(guess.length).fill("absent");
    guess.split("").forEach((c, i) => {
      if (c === solucion.name[i]) {
        feedback[i] = "correct";
        counts[c]--;
      }
    });
    guess.split("").forEach((c, i) => {
      if (feedback[i] === "absent" && counts[c] > 0) {
        feedback[i] = "present";
        counts[c]--;
      }
    });
    const nuevos = [...intentos, { guess, feedback }];
    setIntentos(nuevos);
    setEntrada("");
    const isWin = guess === solucion.name;
    const isEnd = isWin || nuevos.length >= MAX_INTENTOS;
    if (isEnd) {
      const rec = {
        date: today,
        solution: solucion.name,
        anime: solucion.anime,
        win: isWin,
        attempts: nuevos.length,
      };
      localStorage.setItem(storageKey, JSON.stringify(rec));
      setRecord(rec);
      setPlayedToday(true); // bloquear más entradas
      setMessage(
        isWin
          ? `🎉 ¡Acertaste en ${nuevos.length} intentos! Vuelve mañana.`
          : `❌ Fin de intentos. Era ${solucion.name}. Vuelve mañana.`,
      );
    } else {
      setMessage("");
    }
  }

  return (
    <div className="otaku-guess">
      <h1>OtakuGuess</h1>
      <p className="subtitle">
        {playedToday
          ? `Personaje de ${solucion.anime}`
          : `Personaje de ${solucion.anime} (${solucion.name.length} letras)`}
      </p>

      <div className="grid">
        {Array.from({ length: MAX_INTENTOS }).map((_, row) => (
          <div key={row} className="row">
            {Array.from({ length: solucion.name.length }).map((_, col) => {
              const cell = intentos[row]?.guess[col] || "";
              const status = intentos[row]?.feedback[col] || "";
              return (
                <div key={col} className={`cell ${status}`}>
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!playedToday && (
        <form onSubmit={handleSubmit} className="input-row">
          <input
            type="text"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            maxLength={solucion.name.length}
            className="guess-input"
            placeholder="Tu intento"
          />
          <button type="submit" className="guess-btn">
            Go
          </button>
        </form>
      )}

      {message && <p className="message">{message}</p>}

      {playedToday && record && (
        <div className="banner">
          <h2>{record.win ? "🏆 ¡Victoria de ayer!" : "😞 Intento de ayer"}</h2>
          <p>
            Ayer{" "}
            {record.win
              ? `acertaste en ${record.attempts} intentos.`
              : `agotaste ${MAX_INTENTOS} intentos sin éxito.`}
          </p>
        </div>
      )}
    </div>
  );
}
