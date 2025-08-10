import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { generateChartColors } from "@/lib/dataProcessor";

interface ChartData {
  plannedFull: { channel: string; duration: number }[];
  unplannedFull: { channel: string; duration: number }[];
  plannedPartial: { channel: string; duration: number }[];
  unplannedPartial: { channel: string; duration: number; incident?: string }[];
}

interface DowntimeChartsProps {
  chartData: ChartData;
}

export default function DowntimeCharts({ chartData }: DowntimeChartsProps) {
  const plannedFullRef = useRef<HTMLCanvasElement>(null);
  const unplannedFullRef = useRef<HTMLCanvasElement>(null);
  const plannedPartialRef = useRef<HTMLCanvasElement>(null);
  const unplannedPartialRef = useRef<HTMLCanvasElement>(null);
  
  const chartsRef = useRef<{ [key: string]: Chart }>({});

  useEffect(() => {
    // Cleanup existing charts
    Object.values(chartsRef.current).forEach(chart => chart.destroy());
    chartsRef.current = {};

    // Create Planned Full chart
    if (plannedFullRef.current && chartData.plannedFull.length > 0) {
      const ctx = plannedFullRef.current.getContext('2d');
      if (ctx) {
        const labels = chartData.plannedFull.map(item => item.channel);
        const data = chartData.plannedFull.map(item => item.duration);
        const colors = generateChartColors(labels.length);

        chartsRef.current.plannedFull = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {
                    family: 'Inter',
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                    return `${label}: ${value} min (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Create Unplanned Full chart
    if (unplannedFullRef.current && chartData.unplannedFull.length > 0) {
      const ctx = unplannedFullRef.current.getContext('2d');
      if (ctx) {
        const labels = chartData.unplannedFull.map(item => item.channel);
        const data = chartData.unplannedFull.map(item => item.duration);
        const colors = generateChartColors(labels.length);

        chartsRef.current.unplannedFull = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {
                    family: 'Inter',
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    return `${label}: ${value} min`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Create Planned Partial chart
    if (plannedPartialRef.current && chartData.plannedPartial.length > 0) {
      const ctx = plannedPartialRef.current.getContext('2d');
      if (ctx) {
        const labels = chartData.plannedPartial.map(item => item.channel);
        const data = chartData.plannedPartial.map(item => item.duration);
        const colors = generateChartColors(labels.length);

        chartsRef.current.plannedPartial = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {
                    family: 'Inter',
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                    return `${label}: ${value} min (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Create Unplanned Partial chart
    if (unplannedPartialRef.current && chartData.unplannedPartial.length > 0) {
      const ctx = unplannedPartialRef.current.getContext('2d');
      if (ctx) {
        const labels = chartData.unplannedPartial.map(item => item.channel);
        const data = chartData.unplannedPartial.map(item => item.duration);
        const colors = generateChartColors(labels.length);

        chartsRef.current.unplannedPartial = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 8,
                  font: {
                    family: 'Inter',
                    size: 10
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                    return `${label}: ${value} min (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      Object.values(chartsRef.current).forEach(chart => chart.destroy());
    };
  }, [chartData]);

  return (
    <div className="dashboard-section">
      <h2>Downtime Analysis by Category</h2>
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Planned Full Downtime</h3>
          <p className="section-subtitle">Database Maintenance - All Services</p>
          <div className="chart-container">
            {chartData.plannedFull.length > 0 ? (
              <canvas ref={plannedFullRef}></canvas>
            ) : (
              <div className="no-data">
                No planned full downtime incidents in this period
              </div>
            )}
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Unplanned Full Downtime</h3>
          <p className="section-subtitle">Complete service outages</p>
          <div className="chart-container">
            {chartData.unplannedFull.length > 0 ? (
              <canvas ref={unplannedFullRef}></canvas>
            ) : (
              <div className="no-data">
                No unplanned full downtime incidents in this period
              </div>
            )}
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Unplanned Partial Downtime</h3>
          <p className="section-subtitle">Service degradation incidents</p>
          <div className="chart-container">
            {chartData.unplannedPartial.length > 0 ? (
              <canvas ref={unplannedPartialRef}></canvas>
            ) : (
              <div className="no-data">
                No unplanned partial downtime incidents in this period
              </div>
            )}
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Planned Partial Downtime</h3>
          <p className="section-subtitle">Scheduled partial maintenance</p>
          <div className="chart-container">
            {chartData.plannedPartial.length > 0 ? (
              <canvas ref={plannedPartialRef}></canvas>
            ) : (
              <div className="no-data">
                No planned partial downtime incidents in this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
