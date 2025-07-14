// File: frontend/src/components/games/OtakuTrivia.js
import React, { useState, useEffect } from "react";
import "./OtakuTrivia.css";

const QUESTIONS = [
  {
    q: "¿En qué serie aparece Ace?",
    options: ["One Piece", "Naruto", "Bleach", "Dragon Ball"],
    answer: 0,
  },
  {
    q: "¿Quién es el cuarto Hokage?",
    options: ["Minato Namikaze", "Kakashi", "Tsunade", "Jiraiya"],
    answer: 0,
  },
  {
    q: "¿Qué técnica usa Goku?",
    options: ["Kamehameha", "Rasengan", "Bankai", "Getsuga"],
    answer: 0,
  },
  {
    q: "Protagonista de My Hero Academia:",
    options: ["Deku", "Todoroki", "Bakugo", "Uraraka"],
    answer: 0,
  },
  {
    q: "¿Fruta de Luffy?",
    options: ["Gomu Gomu", "Mera Mera", "Nikyu Nikyu", "Bara Bara"],
    answer: 0,
  },
];

export default function OtakuTrivia() {
  const today = new Date().toISOString().slice(0, 10);
  const key = "otakuTriviaRecord";
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [played, setPlayed] = useState(false);
  const [record, setRecord] = useState(null);

  // cargar record
  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem(key) || "{}");
    if (rec.date === today) {
      setPlayed(true);
      setRecord(rec);
    }
  }, []);

  function next() {
    if (sel === QUESTIONS[idx].answer) setScore((s) => s + 1);
    if (idx + 1 < QUESTIONS.length) {
      setIdx((i) => i + 1);
      setSel(null);
    } else {
      const rec = { date: today, score };
      localStorage.setItem(key, JSON.stringify(rec));
      setRecord(rec);
      setDone(true);
      setPlayed(true);
    }
  }
  function restart() {
    setIdx(0);
    setScore(0);
    setSel(null);
    setDone(false);
  }

  if (played && !done) {
    return (
      <div className="trivia">
        <h1>Trivia Otaku</h1>
        <p>Ya jugaste hoy. Vuelve mañana.</p>
        {record && (
          <p>
            Puntuación de hoy: {record.score}/{QUESTIONS.length}
          </p>
        )}
      </div>
    );
  }
  if (played && done) {
    return (
      <div className="trivia">
        <h1>Trivia Otaku</h1>
        <p>Ya completaste hoy.</p>
        <p>
          Puntuación: {record.score}/{QUESTIONS.length}
        </p>
      </div>
    );
  }

  const cur = QUESTIONS[idx];
  return (
    <div className="trivia">
      <h1>Trivia Otaku</h1>
      <p className="progress">
        Pregunta {idx + 1}/{QUESTIONS.length}
      </p>
      <p className="question">{cur.q}</p>
      <div className="opt-grid">
        {cur.options.map((o, i) => (
          <button
            key={i}
            className={`opt ${sel === i ? "sel" : ""}`}
            onClick={() => setSel(i)}
          >
            {o}
          </button>
        ))}
      </div>
      <button disabled={sel === null} onClick={next} className="trivia-btn">
        {idx + 1 < QUESTIONS.length ? "Siguiente" : "Terminar"}
      </button>
    </div>
  );
}
