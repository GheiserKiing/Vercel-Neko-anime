// File: frontend/src/components/games/AnimedleUniversal.js
import React, { useState, useEffect } from "react";
import personajes from "../../data/personajes.json";
import "./AnimedleUniversal.css";

export default function AnimedleUniversal() {
  const today = new Date().toISOString().slice(0, 10);
  const animeOfDay = "Naruto";
  const storageKey = `animedle-${animeOfDay}`;
  const list = personajes.filter((p) => p.anime === animeOfDay);

  const [solution, setSolution] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Inicializar solución y estado
  useEffect(() => {
    const idx = parseInt(today.replace(/-/g, ""), 10) % list.length;
    setSolution(list[idx]);
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (stored.lastDate === today) setDone(true);
  }, []);

  // Temporizador diario
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = next - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!solution || done) return;
    const nameGuess = input.trim();
    const match = list.find(
      (p) => p.name.toLowerCase() === nameGuess.toLowerCase(),
    );
    if (!match) {
      alert("Selecciona un personaje válido");
      return;
    }
    // Feedback por propiedad
    const f = {};
    ["gender", "affiliation", "kekkeiGenkai", "debutArc"].forEach((key) => {
      if (match[key] === solution[key]) f[key] = "correct";
      else if (
        Array.isArray(solution[key]) &&
        solution[key].includes(match[key])
      )
        f[key] = "present";
      else if (!Array.isArray(solution[key]) && solution[key] === match[key])
        f[key] = "correct";
      else f[key] = "absent";
    });
    ["jutsuTypes", "natureTypes", "attributes"].forEach((key) => {
      f[key] = match[key].map((val) =>
        solution[key].includes(val) ? "present" : "absent",
      );
    });
    // Guardar solo el nombre como string
    const newAttempt = { guess: match.name, feedback: f };
    setAttempts((a) => [...a, newAttempt]);
    setInput("");
    if (match.name === solution.name) setDone(true);
  }

  return (
    <div className="animedle">
      <h1>Animedle Universal</h1>
      <p className="anime-of-day">
        Hoy: <strong>{animeOfDay}</strong>
      </p>

      {!done && solution && (
        <form onSubmit={handleSubmit} className="guess-form">
          <input
            list="chars"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe o elige personaje..."
            className="guess-input"
          />
          <datalist id="chars">
            {list.map((p) => (
              <option key={p.name} value={p.name} />
            ))}
          </datalist>
          <button type="submit" className="guess-btn">
            ➤
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <div className="header-row">
          <div>Avatar</div>
          <div>Género</div>
          <div>Afiliación</div>
          <div>Jutsu</div>
          <div>Kekkei</div>
          <div>Naturaleza</div>
          <div>Atributos</div>
          <div>Debut</div>
        </div>
        {attempts.map((a, i) => (
          <div key={i} className="data-row">
            <div className="avatar-cell">
              <img
                src={`/images/avatars/${a.guess.replace(/ /g, "_")}.jpg`}
                alt={a.guess}
              />
            </div>
            <div className={`cell ${a.feedback.gender}`}>{solution.gender}</div>
            <div className={`cell ${a.feedback.affiliation}`}>
              {solution.affiliation}
            </div>
            <div className="cell-list">
              {a.feedback.jutsuTypes.map((f, j) => (
                <span key={j} className={`cell ${f}`}>
                  {solution.jutsuTypes[j]}
                </span>
              ))}
            </div>
            <div className={`cell ${a.feedback.kekkeiGenkai}`}>
              {solution.kekkeiGenkai}
            </div>
            <div className="cell-list">
              {a.feedback.natureTypes.map((f, j) => (
                <span key={j} className={`cell ${f}`}>
                  {solution.natureTypes[j]}
                </span>
              ))}
            </div>
            <div className="cell-list">
              {a.feedback.attributes.map((f, j) => (
                <span key={j} className={`cell ${f}`}>
                  {solution.attributes[j]}
                </span>
              ))}
            </div>
            <div className={`cell ${a.feedback.debutArc}`}>
              {solution.debutArc}
            </div>
          </div>
        ))}
      </div>

      {done && solution && (
        <div className="legend">
          <h2>Indicadores</h2>
          <div className="legend-row">
            <span className="legend-cell correct">Correcto</span>
            <span className="legend-cell present">Parcial</span>
            <span className="legend-cell absent">No está</span>
          </div>
          <div className="next-timer">Próximo reto en {timeLeft}</div>
        </div>
      )}
    </div>
  );
}
