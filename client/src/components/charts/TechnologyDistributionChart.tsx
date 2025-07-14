import { useEffect, useRef } from "react";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
import { TECH_COLORS } from "@/lib/constants";

Chart.register(...registerables);

interface TechnologyDistributionChartProps {
  data: {
    efficiency: number;
    renewable: number;
    hvac: number;
    storage: number;
    ev: number;
    research: number;
  };
  className?: string;
}

export default function TechnologyDistributionChart({ 
  data, 
  className = "h-full w-full" 
}: TechnologyDistributionChartProps) {
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
    
    const labels = [
      "Energy Efficiency",
      "Renewable Energy",
      "HVAC/Heat Pumps",
      "Energy Storage",
      "EV/Transportation",
      "Innovation/R&D"
    ];
    
    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: "Number of Programs",
          data: [
            data.efficiency,
            data.renewable,
            data.hvac,
            data.storage,
            data.ev,
            data.research
          ],
          backgroundColor: [
            TECH_COLORS.efficiency,
            TECH_COLORS.renewable,
            TECH_COLORS.hvac,
            TECH_COLORS.storage,
            TECH_COLORS.ev,
            TECH_COLORS.research
          ],
          borderRadius: 6,
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverBackgroundColor: [
            TECH_COLORS.efficiency + 'CC',
            TECH_COLORS.renewable + 'CC',
            TECH_COLORS.hvac + 'CC',
            TECH_COLORS.storage + 'CC',
            TECH_COLORS.ev + 'CC',
            TECH_COLORS.research + 'CC'
          ],
        },
      ],
    };
    
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#f9fafb',
          bodyColor: '#f9fafb',
          borderColor: '#6b7280',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `${value} programs`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#6b7280',
            font: {
              weight: 500
            },
            display: false
          },
          grid: {
            color: "#e5e7eb",
            lineWidth: 1,
          },
        },
        y: {
          ticks: {
            color: '#374151',
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
          },
        },
      },
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart'
      }
    };
    
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options,
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} className={className}></canvas>;
}
