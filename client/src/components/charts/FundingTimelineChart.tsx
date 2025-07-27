import { useEffect, useRef } from "react";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

Chart.register(...registerables);

interface FundingTimelineChartProps {
  className?: string;
}

export default function FundingTimelineChart({ 
  className = "h-full w-full" 
}: FundingTimelineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    
    // Realistic funding data showing growth over time
    const fundingData = [
      { quarter: "Q1 2024", federal: 45.2, state: 18.5, local: 8.3, utility: 12.1 },
      { quarter: "Q2 2024", federal: 62.8, state: 23.7, local: 11.2, utility: 15.9 },
      { quarter: "Q3 2024", federal: 78.3, state: 31.4, local: 14.8, utility: 19.2 },
      { quarter: "Q4 2024", federal: 95.1, state: 38.9, local: 18.6, utility: 23.7 },
      { quarter: "Q1 2025", federal: 118.7, state: 45.3, local: 22.1, utility: 28.4 }
    ];

    const chartData: ChartData = {
      labels: fundingData.map(d => d.quarter),
      datasets: [
        {
          label: "Federal Programs",
          data: fundingData.map(d => d.federal),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
        {
          label: "State Programs",
          data: fundingData.map(d => d.state),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(16, 185, 129)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
        {
          label: "Local Programs",
          data: fundingData.map(d => d.local),
          backgroundColor: "rgba(245, 101, 101, 0.8)",
          borderColor: "rgb(245, 101, 101)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(245, 101, 101)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
        {
          label: "Utility Programs",
          data: fundingData.map(d => d.utility),
          backgroundColor: "rgba(168, 85, 247, 0.8)",
          borderColor: "rgb(168, 85, 247)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(168, 85, 247)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    };
    
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 600
            },
            color: '#374151'
          },
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          titleColor: '#f9fafb',
          bodyColor: '#f9fafb',
          borderColor: '#6b7280',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.raw as number;
              return `${label}: $${value.toFixed(1)}B`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(229, 231, 235, 0.5)",
            lineWidth: 1,
          },
          ticks: {
            color: '#6b7280',
            font: {
              weight: 500,
              size: 12
            }
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(229, 231, 235, 0.5)",
            lineWidth: 1,
          },
          ticks: {
            color: '#6b7280',
            font: {
              weight: 500,
              size: 12
            },
            callback: function(value) {
              return '$' + value + 'B';
            }
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    };
    
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: chartData,
      options,
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} className={className}></canvas>;
}