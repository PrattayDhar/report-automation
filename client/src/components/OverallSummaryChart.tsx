import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { formatDuration } from '@/lib/dataProcessor';

interface OverallSummaryChartProps {
  summary: {
    totalIncidents: number;
    totalDuration: number;
    plannedDuration: number;
    unplannedDuration: number;
    plannedFullDuration: number;
    plannedPartialDuration: number;
    unplannedFullDuration: number;
    unplannedPartialDuration: number;
  };
  chartData: {
    plannedFull: { channel: string; duration: number }[];
    unplannedFull: { channel: string; duration: number }[];
    plannedPartial: { channel: string; duration: number }[];
    unplannedPartial: { channel: string; duration: number }[];
  };
}

export default function OverallSummaryChart({ summary, chartData }: OverallSummaryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Calculate totals for each category - use summary data for actual time periods
        const serviceUptime = 10080 - summary.totalDuration; // Assuming 7 days * 24 hours * 60 minutes = 10080 minutes per week
        const unplannedPartialTotal = summary.unplannedPartialDuration;
        const unplannedFullTotal = summary.unplannedFullDuration;
        const plannedFullTotal = summary.plannedFullDuration;
        const plannedPartialTotal = summary.plannedPartialDuration;

        const data = [
          serviceUptime,
          unplannedPartialTotal,
          unplannedFullTotal,
          plannedFullTotal,
          plannedPartialTotal
        ];

        const labels = [
          'Service Uptime',
          'Unplanned Partial',
          'Unplanned Full', 
          'Planned Full',
          'Planned Partial'
        ];

        const colors = [
          '#28a745', // Green for uptime
          '#ffc107', // Yellow for unplanned partial
          '#dc3545', // Red for unplanned full
          '#007bff', // Blue for planned full
          '#6f42c1'  // Purple for planned partial
        ];

        chartInstance.current = new Chart(ctx, {
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
                position: 'right',
                labels: {
                  boxWidth: 12,
                  padding: 15,
                  font: {
                    family: 'Inter',
                    size: 12
                  },
                  generateLabels: function(chart) {
                    const original = Chart.defaults.plugins.legend.labels.generateLabels;
                    const labels = original.call(this, chart);
                    
                    labels.forEach((label, index) => {
                      const value = data[index];
                      const percentage = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                      label.text = `${label.text}: ${value} min (${percentage}%)`;
                    });
                    
                    return labels;
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
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [summary, chartData]);

  // Calculate totals for the table - use summary data to show actual time periods (not channel duplicated)
  const serviceUptime = 10080 - summary.totalDuration;
  const unplannedPartialTotal = summary.unplannedPartialDuration;
  const unplannedFullTotal = summary.unplannedFullDuration;
  const plannedFullTotal = summary.plannedFullDuration;
  const plannedPartialTotal = summary.plannedPartialDuration;

  return (
    <div className="dashboard-section">
      <h2>Overall Downtime Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Summary Table */}
        <div>
          <table className="incident-table" style={{ marginTop: '0' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Duration (minutes)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: '#28a745', fontWeight: '600' }}>Service Uptime</td>
                <td style={{ color: '#28a745', fontWeight: '600' }}>{serviceUptime.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ color: '#ffc107', fontWeight: '600' }}>Unplanned Partial</td>
                <td style={{ color: '#ffc107', fontWeight: '600' }}>{unplannedPartialTotal}</td>
              </tr>
              <tr>
                <td style={{ color: '#dc3545', fontWeight: '600' }}>Unplanned Full</td>
                <td style={{ color: '#dc3545', fontWeight: '600' }}>{unplannedFullTotal}</td>
              </tr>
              <tr>
                <td style={{ color: '#007bff', fontWeight: '600' }}>Planned Full</td>
                <td style={{ color: '#007bff', fontWeight: '600' }}>{plannedFullTotal}</td>
              </tr>
              <tr>
                <td style={{ color: '#6f42c1', fontWeight: '600' }}>Planned Partial</td>
                <td style={{ color: '#6f42c1', fontWeight: '600' }}>{plannedPartialTotal}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--dashboard-text)' }}>Key Metrics</h4>
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
              <strong>Total Downtime:</strong> {formatDuration(summary.totalDuration)}
            </p>
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
              <strong>Availability:</strong> {(((serviceUptime) / (serviceUptime + summary.totalDuration)) * 100).toFixed(2)}%
            </p>
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
              <strong>Planned vs Unplanned:</strong> {summary.plannedDuration}min vs {summary.unplannedDuration}min
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-wrapper" style={{ margin: '0' }}>
          <h3>Weekly Downtime Distribution</h3>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}