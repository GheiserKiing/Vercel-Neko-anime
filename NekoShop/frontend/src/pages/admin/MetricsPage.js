// File: NekoShop/NekoShop/frontend/src/pages/admin/MetricsPage.js
import React, { useRef, useEffect, useState } from "react"; // ✅ Importamos React y useRef juntos
import Chart from "chart.js/auto";
import { fetchOrderMetrics } from "../../services/metricsService";
import "./MetricsPage.css";

export default function MetricsPage() {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [metrics, setMetrics] = useState({ labels: [], values: [] });

  // 1️⃣ Al montar, pedimos datos de métricas
  useEffect(() => {
    async function load() {
      const data = await fetchOrderMetrics();
      setMetrics({
        labels: data.map((d) => d.date),
        values: data.map((d) => d.count),
      });
    }
    load();
  }, []);

  // 2️⃣ Cada vez que cambian metrics, (re)dibujamos el gráfico
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    // Si ya había un gráfico, lo destruimos antes
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: metrics.labels,
        datasets: [
          {
            label: "Pedidos por Día",
            data: metrics.values,
            tension: 0.3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });
  }, [metrics]);

  return (
    <div className="metrics-page">
      <h1>Métricas de Pedidos</h1>
      <canvas ref={canvasRef} />
    </div>
  );
}
