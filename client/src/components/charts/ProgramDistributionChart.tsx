import { useEffect, useRef } from "react";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
import { CHART_COLORS } from "@/lib/constants";

Chart.register(...registerables);

interface ProgramDistributionChartProps {
  data: {
    federal: number;
    state: number;
    local: number;
    utility: number;
    foundation: number;
  };
  className?: string;
}

export default function ProgramDistributionChart({ 
  data, 
  className = "h-full w-full" 
}: ProgramDistributionChartProps) {
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
    
    const chartData: ChartData = {
      labels: ["Federal", "State", "Local/NYC", "Utility", "Foundation"],
      datasets: [
        {
          data: [data.federal, data.state, data.local, data.utility, data.foundation],
          backgroundColor: [
            CHART_COLORS.federal,
            CHART_COLORS.state,
            CHART_COLORS.local,
            CHART_COLORS.utility,
            CHART_COLORS.foundation
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverBackgroundColor: [
            CHART_COLORS.federal + '80',
            CHART_COLORS.state + '80',
            CHART_COLORS.local + '80',
            CHART_COLORS.utility + '80',
            CHART_COLORS.foundation + '80'
          ],
          hoverBorderWidth: 3,
        },
      ],
    };
    
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 500
            },
            color: '#374151'
          },
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
              const label = context.label || "";
              const value = context.raw as number;
              const total = context.dataset.data.reduce(
                (acc: number, curr) => acc + (typeof curr === 'number' ? curr : 0),
                0
              );
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        duration: 1000
      }
    };
    
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
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
