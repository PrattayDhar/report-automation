import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { WeeklyReport } from '@shared/schema';

interface WeeklyTrendsProps {
  reports: WeeklyReport[];
}

export default function WeeklyTrends({ reports }: WeeklyTrendsProps) {
  const totalDowntimeRef = useRef<HTMLCanvasElement>(null);
  const incidentCountRef = useRef<HTMLCanvasElement>(null);
  const plannedVsUnplannedRef = useRef<HTMLCanvasElement>(null);
  
  const chartsRef = useRef<{ [key: string]: Chart }>({});

  useEffect(() => {
    // Cleanup existing charts
    Object.values(chartsRef.current).forEach(chart => chart.destroy());
    chartsRef.current = {};

    // Sort reports by date to ensure proper trend display
    const sortedReports = [...reports].sort((a, b) => 
      new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );

    const labels = sortedReports.map(report => report.weekLabel);
    
    // Total Downtime Trend
    if (totalDowntimeRef.current) {
      const ctx = totalDowntimeRef.current.getContext('2d');
      if (ctx) {
        const totalDowntimeData = sortedReports.map(report => report.summary.totalDuration);
        const plannedData = sortedReports.map(report => report.summary.plannedDuration);
        const unplannedData = sortedReports.map(report => report.summary.unplannedDuration);

        chartsRef.current.totalDowntime = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Total Downtime (minutes)',
                data: totalDowntimeData,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Planned Downtime (minutes)',
                data: plannedData,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: false,
              },
              {
                label: 'Unplanned Downtime (minutes)',
                data: unplannedData,
                borderColor: '#FFCE56',
                backgroundColor: 'rgba(255, 206, 86, 0.1)',
                tension: 0.4,
                fill: false,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Duration (minutes)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Week'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.parsed.y;
                    const hours = Math.floor(value / 60);
                    const minutes = value % 60;
                    return `${context.dataset.label}: ${hours}h ${minutes}m`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Incident Count Trend
    if (incidentCountRef.current) {
      const ctx = incidentCountRef.current.getContext('2d');
      if (ctx) {
        const incidentData = sortedReports.map(report => report.summary.totalIncidents);

        chartsRef.current.incidentCount = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Number of Incidents',
              data: incidentData,
              backgroundColor: '#4BC0C0',
              borderColor: '#4BC0C0',
              borderWidth: 1,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Incidents'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Week'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
              }
            }
          }
        });
      }
    }

    // Planned vs Unplanned Percentage Trend
    if (plannedVsUnplannedRef.current) {
      const ctx = plannedVsUnplannedRef.current.getContext('2d');
      if (ctx) {
        const plannedPercentages = sortedReports.map(report => {
          const total = report.summary.totalDuration;
          return total > 0 ? (report.summary.plannedDuration / total) * 100 : 0;
        });
        
        const unplannedPercentages = sortedReports.map(report => {
          const total = report.summary.totalDuration;
          return total > 0 ? (report.summary.unplannedDuration / total) * 100 : 0;
        });

        chartsRef.current.plannedVsUnplanned = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Planned Downtime (%)',
                data: plannedPercentages,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: false,
              },
              {
                label: 'Unplanned Downtime (%)',
                data: unplannedPercentages,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: false,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Percentage (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Week'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
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
  }, [reports]);

  // Calculate trend indicators
  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return { direction: 'neutral', change: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  const latest = reports[0];
  const previous = reports[1];
  
  const totalTrend = previous ? getTrendIndicator(latest.summary.totalDuration, previous.summary.totalDuration) : null;
  const incidentTrend = previous ? getTrendIndicator(latest.summary.totalIncidents, previous.summary.totalIncidents) : null;

  return (
    <div className="dashboard-section">
      <h3>Weekly Downtime Trends</h3>
      
      {/* Trend Summary */}
      {totalTrend && incidentTrend && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div className="summary-card">
            <h4>Total Downtime Trend</h4>
            <div className="value" style={{ 
              color: totalTrend.direction === 'up' ? 'var(--dashboard-error)' : 
                     totalTrend.direction === 'down' ? 'var(--dashboard-success)' : 
                     'var(--dashboard-text)' 
            }}>
              {totalTrend.direction === 'up' ? '↑' : totalTrend.direction === 'down' ? '↓' : '→'} 
              {totalTrend.change.toFixed(1)}%
            </div>
            <div className="unit">vs last week</div>
          </div>
          
          <div className="summary-card">
            <h4>Incident Count Trend</h4>
            <div className="value" style={{ 
              color: incidentTrend.direction === 'up' ? 'var(--dashboard-error)' : 
                     incidentTrend.direction === 'down' ? 'var(--dashboard-success)' : 
                     'var(--dashboard-text)' 
            }}>
              {incidentTrend.direction === 'up' ? '↑' : incidentTrend.direction === 'down' ? '↓' : '→'} 
              {incidentTrend.change.toFixed(1)}%
            </div>
            <div className="unit">vs last week</div>
          </div>
        </div>
      )}

      {/* Trend Charts */}
      <div className="charts-container">
        <div className="chart-wrapper">
          <h4>Total Downtime Over Time</h4>
          <div className="chart-container">
            <canvas ref={totalDowntimeRef}></canvas>
          </div>
        </div>

        <div className="chart-wrapper">
          <h4>Incident Count by Week</h4>
          <div className="chart-container">
            <canvas ref={incidentCountRef}></canvas>
          </div>
        </div>

        <div className="chart-wrapper">
          <h4>Planned vs Unplanned Downtime Ratio</h4>
          <div className="chart-container">
            <canvas ref={plannedVsUnplannedRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}