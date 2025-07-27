import { useEffect, useRef } from "react";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";

Chart.register(...registerables);

interface IncentiveROIChartProps {
  className?: string;
}

export default function IncentiveROIChart({ 
  className = "h-full w-full" 
}: IncentiveROIChartProps) {
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
    
    // ROI data for different project types
    const roiData = [
      { 
        projectType: "Solar Installation", 
        incentiveAmount: 125000, 
        projectCost: 420000, 
        savings: 85000,
        roi: 42.5,
        payback: 2.8
      },
      { 
        projectType: "Heat Pump Upgrade", 
        incentiveAmount: 35000, 
        projectCost: 95000, 
        savings: 28000,
        roi: 38.2,
        payback: 3.2
      },
      { 
        projectType: "Energy Storage", 
        incentiveAmount: 85000, 
        projectCost: 185000, 
        savings: 42000,
        roi: 35.7,
        payback: 3.6
      },
      { 
        projectType: "Building Envelope", 
        incentiveAmount: 65000, 
        projectCost: 225000, 
        savings: 55000,
        roi: 32.1,
        payback: 4.1
      },
      { 
        projectType: "EV Charging", 
        incentiveAmount: 45000, 
        projectCost: 125000, 
        savings: 32000,
        roi: 29.8,
        payback: 4.5
      },
      { 
        projectType: "Smart Building", 
        incentiveAmount: 95000, 
        projectCost: 285000, 
        savings: 68000,
        roi: 26.4,
        payback: 4.8
      }
    ];

    const chartData: ChartData = {
      labels: roiData.map(d => d.projectType),
      datasets: [
        {
          label: "ROI (%)",
          data: roiData.map(d => d.roi),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: 'y',
        },
        {
          label: "Incentive Amount ($K)",
          data: roiData.map(d => d.incentiveAmount / 1000),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: 'y1',
        }
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
              const dataPoint = roiData[context.dataIndex];
              if (context.datasetIndex === 0) {
                return [
                  `ROI: ${dataPoint.roi}%`,
                  `Payback: ${dataPoint.payback} years`,
                  `Annual Savings: $${(dataPoint.savings / 1000).toFixed(0)}K`
                ];
              } else {
                return [
                  `Incentive: $${(dataPoint.incentiveAmount / 1000).toFixed(0)}K`,
                  `Project Cost: $${(dataPoint.projectCost / 1000).toFixed(0)}K`,
                  `Coverage: ${((dataPoint.incentiveAmount / dataPoint.projectCost) * 100).toFixed(1)}%`
                ];
              }
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
              size: 11
            },
            maxRotation: 45,
            minRotation: 45
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: {
            color: "rgba(229, 231, 235, 0.5)",
            lineWidth: 1,
          },
          ticks: {
            color: 'rgb(16, 185, 129)',
            font: {
              weight: 500,
              size: 12
            },
            callback: function(value) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'ROI (%)',
            color: 'rgb(16, 185, 129)',
            font: {
              weight: 600,
              size: 12
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: 'rgb(59, 130, 246)',
            font: {
              weight: 500,
              size: 12
            },
            callback: function(value) {
              return '$' + value + 'K';
            }
          },
          title: {
            display: true,
            text: 'Incentive Amount ($K)',
            color: 'rgb(59, 130, 246)',
            font: {
              weight: 600,
              size: 12
            }
          }
        },
      },
      animation: {
        duration: 1600,
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