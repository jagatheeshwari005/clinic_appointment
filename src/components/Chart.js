import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Chart({ data }) {
  // Count appointments per disease
  const diseaseCount = {};
  (data || []).forEach(app => {
    diseaseCount[app.disease] = (diseaseCount[app.disease] || 0) + 1;
  });

  const chartData = {
    labels: Object.keys(diseaseCount),
    datasets: [
      {
        label: "Number of Appointments",
        data: Object.values(diseaseCount),
        backgroundColor: "rgba(0, 74, 173, 0.7)",
      },
    ],
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <h3>Appointments per Disease</h3>
      <Bar data={chartData} />
    </div>
  );
}

export default Chart;
