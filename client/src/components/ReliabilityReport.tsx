import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ReliabilityData } from '@shared/schema';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReliabilityReportProps {
  reliabilityData: ReliabilityData[];
}

export default function ReliabilityReport({ reliabilityData }: ReliabilityReportProps) {
  const [showChart, setShowChart] = useState(true);

  if (!reliabilityData || reliabilityData.length === 0) {
    return null;
  }

  // Chart configuration
  const chartData = {
    labels: reliabilityData.map(item => item.channel),
    datasets: [
      {
        label: 'Reliability %',
        data: reliabilityData.map(item => item.uptimePercentage),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Reliability by Channel',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Uptime Percentage'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Service Channels'
        }
      }
    }
  };

  return (
    <div className="reliability-report">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
          Reliability Report
        </h2>
        <button
          onClick={() => setShowChart(!showChart)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
        >
          {showChart ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>

      {/* Data Table */}
      <div style={{ marginBottom: '30px', overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9em',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                Affected Area
              </th>
              {/* <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Outage
              </th> */}
              {/* <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Modality
              </th> */}
              {/* <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Reliability Impacted
              </th> */}
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Plan Downtime(min)
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                UnPlanned Full Down
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Duration (hr:min)
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Downtime in MIN
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Week in MIN
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                Uptime
              </th>
            </tr>
          </thead>
          <tbody>
            {reliabilityData.map((item, index) => (
              <tr 
                key={item.channel}
                style={{ 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}
              >
                <td style={{ padding: '12px', fontWeight: '500' }}>
                  {item.channel}
                </td>
                {/* <td style={{ padding: '12px', textAlign: 'center' }}>
                  Full
                </td> */}
                {/* <td style={{ padding: '12px', textAlign: 'center' }}>
                  Unplanned
                </td> */}
                {/* <td style={{ padding: '12px', textAlign: 'center' }}>
                  Yes
                </td> */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {item.plannedDowntime}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {item.unplannedFullDowntime}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {Math.floor(item.unplannedFullDowntime / 60)}:{(item.unplannedFullDowntime % 60).toString().padStart(2, '0')}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {item.unplannedFullDowntime}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {item.totalMinutesInPeriod}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: item.uptimePercentage >= 99.9 ? '#28a745' : item.uptimePercentage >= 99.0 ? '#ffc107' : '#dc3545'
                }}>
                  {item.uptimePercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      {showChart && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: '400px'
        }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}