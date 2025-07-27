import { useEffect, useRef } from "react";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

Chart.register(...registerables);

interface OpportunityHeatmapChartProps {
  className?: string;
}

export default function OpportunityHeatmapChart({ 
  className = "h-full w-full" 
}: OpportunityHeatmapChartProps) {
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
    
    // Data showing funding opportunity by sector and timeline
    const sectors = ["Commercial", "Multifamily", "Industrial", "Institutional"];
    const timelines = ["Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025"];
    
    const opportunityData = [
      { sector: "Commercial", timeline: "Q4 2024", funding: 45.2, count: 127 },
      { sector: "Commercial", timeline: "Q1 2025", funding: 52.8, count: 134 },
      { sector: "Commercial", timeline: "Q2 2025", funding: 38.4, count: 89 },
      { sector: "Commercial", timeline: "Q3 2025", funding: 61.7, count: 156 },
      
      { sector: "Multifamily", timeline: "Q4 2024", funding: 32.1, count: 94 },
      { sector: "Multifamily", timeline: "Q1 2025", funding: 41.9, count: 118 },
      { sector: "Multifamily", timeline: "Q2 2025", funding: 28.6, count: 72 },
      { sector: "Multifamily", timeline: "Q3 2025", funding: 48.3, count: 142 },
      
      { sector: "Industrial", timeline: "Q4 2024", funding: 67.4, count: 156 },
      { sector: "Industrial", timeline: "Q1 2025", funding: 73.2, count: 167 },
      { sector: "Industrial", timeline: "Q2 2025", funding: 55.1, count: 123 },
      { sector: "Industrial", timeline: "Q3 2025", funding: 81.5, count: 189 },
      
      { sector: "Institutional", timeline: "Q4 2024", funding: 24.7, count: 68 },
      { sector: "Institutional", timeline: "Q1 2025", funding: 31.4, count: 85 },
      { sector: "Institutional", timeline: "Q2 2025", funding: 19.8, count: 54 },
      { sector: "Institutional", timeline: "Q3 2025", funding: 37.2, count: 98 },
    ];

    const chartData: ChartData = {
      labels: timelines,
      datasets: sectors.map((sector, index) => {
        const sectorData = opportunityData.filter(d => d.sector === sector);
        const colors = [
          "rgba(59, 130, 246, 0.8)",   // Blue
          "rgba(16, 185, 129, 0.8)",   // Green
          "rgba(245, 101, 101, 0.8)",  // Red
          "rgba(168, 85, 247, 0.8)"    // Purple
        ];
        
        return {
          label: sector,
          data: sectorData.map(d => d.funding),
          backgroundColor: colors[index],
          borderColor: colors[index].replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        };
      })
    };
    
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
              const value = context.raw as number;
              const dataPoint = opportunityData.find(d => 
                d.sector === context.dataset.label && 
                d.timeline === context.label
              );
              return [
                `Funding: $${value.toFixed(1)}B`,
                `Programs: ${dataPoint?.count || 0}`
              ];
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
        duration: 1400,
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
  }, []);

  return <canvas ref={chartRef} className={className}></canvas>;
}