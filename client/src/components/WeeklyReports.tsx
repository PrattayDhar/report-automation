import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { WeeklyReport, ProcessedData } from '@shared/schema';
import WeeklyTrends from './WeeklyTrends';

interface WeeklyReportsProps {
  currentData?: ProcessedData;
  csvData?: string;
}

export default function WeeklyReports({ currentData, csvData }: WeeklyReportsProps) {
  const [weekLabel, setWeekLabel] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [showTrends, setShowTrends] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showMTDSummary, setShowMTDSummary] = useState(false);
  const queryClient = useQueryClient();

  const { data: weeklyReports = [], isLoading } = useQuery({
    queryKey: ['/api/weekly-reports'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/weekly-reports');
      return await response.json() as WeeklyReport[];
    },
  });

  const saveReportMutation = useMutation({
    mutationFn: async ({ weekLabel, weekStart, weekEnd, csvData }: { weekLabel: string; weekStart: string; weekEnd: string; csvData: string }) => {
      const response = await apiRequest('POST', '/api/weekly-reports', { weekLabel, weekStart, weekEnd, csvData });
      return await response.json() as WeeklyReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reports'] });
      setWeekLabel('');
      setWeekStart('');
      setWeekEnd('');
      alert('Weekly report saved successfully!');
    },
    onError: (error) => {
      console.error('Error saving report:', error);
      alert('Failed to save weekly report');
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/weekly-reports/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reports'] });
    },
    onError: (error) => {
      console.error('Error deleting report:', error);
      alert('Failed to delete weekly report');
    }
  });

  const handleSaveReport = () => {
    if (!weekLabel.trim()) {
      alert('Please enter a week label');
      return;
    }
    if (!weekStart || !weekEnd) {
      alert('Please select both start and end dates for the week');
      return;
    }
    if (!csvData) {
      alert('No data to save. Please analyze some downtime data first.');
      return;
    }
    saveReportMutation.mutate({ 
      weekLabel: weekLabel.trim(), 
      weekStart, 
      weekEnd, 
      csvData 
    });
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this weekly report?')) {
      deleteReportMutation.mutate(id);
    }
  };

  const handleSelectReport = (id: string) => {
    setSelectedReports(prev => 
      prev.includes(id) 
        ? prev.filter(reportId => reportId !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const getSelectedReportsData = () => {
    return weeklyReports.filter(report => selectedReports.includes(report.id));
  };

  // Calculate Month-to-Date summary
  const calculateMTDSummary = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    
    const mtdReports = weeklyReports.filter(report => {
      const reportDate = new Date(report.weekStart);
      return reportDate >= startOfMonth && reportDate <= now;
    });

    if (mtdReports.length === 0) return null;

    const totalIncidents = mtdReports.reduce((sum, report) => sum + report.summary.totalIncidents, 0);
    const totalDuration = mtdReports.reduce((sum, report) => sum + report.summary.totalDuration, 0);
    const plannedDuration = mtdReports.reduce((sum, report) => sum + report.summary.plannedDuration, 0);
    const unplannedDuration = mtdReports.reduce((sum, report) => sum + report.summary.unplannedDuration, 0);
    const plannedFullDuration = mtdReports.reduce((sum, report) => sum + (report.summary.plannedFullDuration || 0), 0);
    const plannedPartialDuration = mtdReports.reduce((sum, report) => sum + (report.summary.plannedPartialDuration || 0), 0);
    const unplannedFullDuration = mtdReports.reduce((sum, report) => sum + (report.summary.unplannedFullDuration || 0), 0);
    const unplannedPartialDuration = mtdReports.reduce((sum, report) => sum + (report.summary.unplannedPartialDuration || 0), 0);

    return {
      currentMonth,
      weeksIncluded: mtdReports.length,
      summary: {
        totalIncidents,
        totalDuration,
        plannedDuration,
        unplannedDuration,
        plannedFullDuration,
        plannedPartialDuration,
        unplannedFullDuration,
        unplannedPartialDuration,
      },
      reports: mtdReports
    };
  };

  const getCurrentWeekLabel = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const month = startOfWeek.toLocaleString('default', { month: 'short' });
    const day = startOfWeek.getDate();
    const year = startOfWeek.getFullYear();
    return `Week of ${month} ${day}, ${year}`;
  };

  return (
    <div className="dashboard-section">
      <h2>Weekly Report Management</h2>
      
      {/* Save Current Report */}
      {currentData && (
        <div className="input-section" style={{ marginBottom: '20px' }}>
          <h3>Save Current Analysis as Weekly Report</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
              <input
                type="date"
                placeholder="Start Date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1em'
                }}
              />
              <input
                type="date"
                placeholder="End Date"
                value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1em'
                }}
              />
              <input
                type="text"
                placeholder="Week 1, Week 2, etc."
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1em'
                }}
              />
            </div>
            <button
              onClick={handleSaveReport}
              disabled={saveReportMutation.isPending}
              className="analyze-button"
              style={{ 
                width: '100%',
                padding: '10px 20px',
                fontSize: '1em'
              }}
            >
              {saveReportMutation.isPending ? 'Saving...' : 'Save Weekly Report'}
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {weeklyReports.length > 1 && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTrends(!showTrends)}
            className="analyze-button"
            style={{ 
              width: 'auto',
              padding: '10px 20px',
              fontSize: '1em',
              backgroundColor: showTrends ? '#28a745' : 'var(--dashboard-blue)'
            }}
          >
            {showTrends ? 'Hide Trends' : 'Show Weekly Trends'}
          </button>
          
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="analyze-button"
            style={{ 
              width: 'auto',
              padding: '10px 20px',
              fontSize: '1em',
              backgroundColor: showComparison ? '#28a745' : 'var(--dashboard-blue)'
            }}
          >
            {showComparison ? 'Hide Comparison' : 'Compare Reports'}
          </button>
          
          <button
            onClick={() => setShowMTDSummary(!showMTDSummary)}
            className="analyze-button"
            style={{ 
              width: 'auto',
              padding: '10px 20px',
              fontSize: '1em',
              backgroundColor: showMTDSummary ? '#28a745' : '#17a2b8'
            }}
          >
            {showMTDSummary ? 'Hide MTD Summary' : 'Show MTD Summary'}
          </button>
        </div>
      )}

      {/* Weekly Trends Chart */}
      {showTrends && weeklyReports.length > 1 && (
        <WeeklyTrends reports={weeklyReports} />
      )}

      {/* Report Comparison */}
      {showComparison && selectedReports.length > 1 && (
        <div className="dashboard-section">
          <h3>Report Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedReports.length}, 1fr)`, gap: '20px' }}>
            {getSelectedReportsData().map((report) => (
              <div key={report.id} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--dashboard-blue)', textAlign: 'center' }}>
                  {report.weekLabel}
                </h4>
                <p style={{ margin: '0 0 15px 0', color: 'var(--dashboard-muted)', fontSize: '0.9em', textAlign: 'center' }}>
                  {report.weekStart} to {report.weekEnd}
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '600', color: 'var(--dashboard-text)' }}>
                      {report.summary.totalIncidents}
                    </div>
                    <div style={{ fontSize: '0.8em', color: 'var(--dashboard-muted)' }}>Total Incidents</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '600', color: 'var(--dashboard-text)' }}>
                      {Math.floor(report.summary.totalDuration / 60)}h {report.summary.totalDuration % 60}m
                    </div>
                    <div style={{ fontSize: '0.8em', color: 'var(--dashboard-muted)' }}>Total Downtime</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#28a745' }}>
                      {Math.floor(report.summary.plannedDuration / 60)}h {report.summary.plannedDuration % 60}m
                    </div>
                    <div style={{ fontSize: '0.8em', color: 'var(--dashboard-muted)' }}>Planned</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#dc3545' }}>
                      {Math.floor(report.summary.unplannedDuration / 60)}h {report.summary.unplannedDuration % 60}m
                    </div>
                    <div style={{ fontSize: '0.8em', color: 'var(--dashboard-muted)' }}>Unplanned</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.1em', fontWeight: '600', color: 'var(--dashboard-blue)' }}>
                      {((report.summary.plannedDuration / Math.max(report.summary.totalDuration, 1)) * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8em', color: 'var(--dashboard-muted)' }}>Planned Ratio</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedReports.length > 1 && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Comparison Insights</h4>
              {(() => {
                const reports = getSelectedReportsData();
                const latest = reports[0];
                const previous = reports[1];
                const downtimeChange = latest.summary.totalDuration - previous.summary.totalDuration;
                const incidentChange = latest.summary.totalIncidents - previous.summary.totalIncidents;
                
                return (
                  <div style={{ fontSize: '0.9em' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Downtime Change:</strong> 
                      <span style={{ color: downtimeChange > 0 ? '#dc3545' : '#28a745', marginLeft: '5px' }}>
                        {downtimeChange > 0 ? '+' : ''}{downtimeChange} minutes
                        ({downtimeChange > 0 ? '↑' : '↓'} {Math.abs(((downtimeChange / Math.max(previous.summary.totalDuration, 1)) * 100)).toFixed(1)}%)
                      </span>
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Incident Change:</strong> 
                      <span style={{ color: incidentChange > 0 ? '#dc3545' : '#28a745', marginLeft: '5px' }}>
                        {incidentChange > 0 ? '+' : ''}{incidentChange} incidents
                        ({incidentChange > 0 ? '↑' : '↓'} {Math.abs(((incidentChange / Math.max(previous.summary.totalIncidents, 1)) * 100)).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {showComparison && selectedReports.length === 0 && (
        <div className="no-data">
          Select reports below to compare them (maximum 3 reports)
        </div>
      )}

      {/* MTD Summary */}
      {showMTDSummary && (() => {
        const mtdData = calculateMTDSummary();
        return mtdData ? (
          <div className="dashboard-section">
            <h3>Month-to-Date Summary ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
            <div style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <p style={{ color: 'var(--dashboard-muted)', fontSize: '0.9em', margin: 0 }}>
                  Based on {mtdData.weeksIncluded} weekly report{mtdData.weeksIncluded !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '600', color: 'var(--dashboard-text)' }}>
                    {mtdData.summary.totalIncidents}
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--dashboard-muted)' }}>Total Incidents</div>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '600', color: 'var(--dashboard-text)' }}>
                    {Math.floor(mtdData.summary.totalDuration / 60)}h {mtdData.summary.totalDuration % 60}m
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--dashboard-muted)' }}>Total Downtime</div>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '600', color: '#28a745' }}>
                    {Math.floor(mtdData.summary.plannedDuration / 60)}h {mtdData.summary.plannedDuration % 60}m
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--dashboard-muted)' }}>Planned Downtime</div>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#ffeaea', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '600', color: '#dc3545' }}>
                    {Math.floor(mtdData.summary.unplannedDuration / 60)}h {mtdData.summary.unplannedDuration % 60}m
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--dashboard-muted)' }}>Unplanned Downtime</div>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '600', color: 'var(--dashboard-blue)' }}>
                    {((mtdData.summary.plannedDuration / Math.max(mtdData.summary.totalDuration, 1)) * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--dashboard-muted)' }}>Planned Ratio</div>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f3f4', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>Breakdown by Category</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '0.9em' }}>
                  <div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Planned Full:</strong> {Math.floor(mtdData.summary.plannedFullDuration / 60)}h {mtdData.summary.plannedFullDuration % 60}m
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Planned Partial:</strong> {Math.floor(mtdData.summary.plannedPartialDuration / 60)}h {mtdData.summary.plannedPartialDuration % 60}m
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Unplanned Full:</strong> {Math.floor(mtdData.summary.unplannedFullDuration / 60)}h {mtdData.summary.unplannedFullDuration % 60}m
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Unplanned Partial:</strong> {Math.floor(mtdData.summary.unplannedPartialDuration / 60)}h {mtdData.summary.unplannedPartialDuration % 60}m
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            No weekly reports available for the current month.
          </div>
        );
      })()}

      {showComparison && selectedReports.length === 1 && (
        <div className="no-data">
          Select at least 2 reports to see comparison
        </div>
      )}

      {/* Saved Reports List */}
      <div>
        <h3>Saved Weekly Reports ({weeklyReports.length})</h3>
        {isLoading ? (
          <div className="loading">Loading weekly reports...</div>
        ) : weeklyReports.length === 0 ? (
          <div className="no-data">
            No weekly reports saved yet. Analyze some data and save it as a weekly report to start tracking trends.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {weeklyReports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'grid',
                  gridTemplateColumns: showComparison ? 'auto 1fr auto' : '1fr auto',
                  alignItems: 'center',
                  gap: '15px',
                  border: selectedReports.includes(report.id) ? '2px solid var(--dashboard-blue)' : '2px solid transparent'
                }}
              >
                {showComparison && (
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                    disabled={!selectedReports.includes(report.id) && selectedReports.length >= 3}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                )}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--dashboard-blue)' }}>
                    {report.weekLabel}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--dashboard-muted)', fontSize: '0.9em' }}>
                    {report.weekStart} to {report.weekEnd}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                    <div>
                      <strong>{report.summary.totalIncidents}</strong> incidents
                    </div>
                    <div>
                      <strong>{Math.floor(report.summary.totalDuration / 60)}h {report.summary.totalDuration % 60}m</strong> total
                    </div>
                    <div>
                      <strong>{Math.floor(report.summary.plannedDuration / 60)}h {report.summary.plannedDuration % 60}m</strong> planned
                    </div>
                    <div>
                      <strong>{Math.floor(report.summary.unplannedDuration / 60)}h {report.summary.unplannedDuration % 60}m</strong> unplanned
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  disabled={deleteReportMutation.isPending}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--dashboard-error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}