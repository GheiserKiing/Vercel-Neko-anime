// File: NekoShop/NekoShop/frontend/src/pages/admin/MetricsTab.jsx
import React, { useRef, useEffect, useState } from "react"; // import React and useRef
import Chart from "chart.js/auto";
import "./MetricsTab.css";

export default function MetricsTab() {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [metrics, setMetrics] = useState({ labels: [], values: [] });

  useEffect(() => {
    async function load() {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/metrics`);
      if (!res.ok) return;
      const data = await res.json();
      setMetrics({
        labels: data.map((d) => d.date),
        values: data.map((d) => d.count),
      });
    }
    load();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: metrics.labels,
        datasets: [{ label: "Pedidos/día", data: metrics.values, tension: 0.3 }],
      },
      options: { responsive: true, scales: { x: { grid: { display: false } } } },
    });
  }, [metrics]);

  return (
    <div className="metrics-tab">
      <h2>Métricas de Pedidos</h2>
      <canvas ref={canvasRef} />
    </div>
  );
}
