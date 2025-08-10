import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { processDowntimeData } from '@/lib/dataProcessor';
import { apiRequest } from '@/lib/queryClient';
import SummaryCards from '@/components/SummaryCards';
import DowntimeCharts from '@/components/DowntimeCharts';
import IncidentTable from '@/components/IncidentTable';
import WeeklyReports from '@/components/WeeklyReports';
import OverallSummaryChart from '@/components/OverallSummaryChart';
import ReliabilityReport from '@/components/ReliabilityReport';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Home, FileText, Upload, Download, Play } from 'lucide-react';
import type { ProcessedData } from '@shared/schema';

export default function Dashboard() {
  const [csvData, setCsvData] = useState('');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processMutation = useMutation({
    mutationFn: processDowntimeData,
    onSuccess: (data) => {
      setProcessedData(data);
      // Scroll to results
      document.getElementById('resultsSection')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    },
    onError: (error) => {
      console.error('Error processing data:', error);
      alert('Error processing data. Please check your CSV format.');
    }
  });

  const handleProcess = () => {
    if (!csvData.trim()) {
      alert('Please enter CSV data');
      return;
    }
    processMutation.mutate(csvData);
  };

  const downloadPowerPoint = useMutation({
    mutationFn: async (csvData: string) => {
      const response = await fetch('/api/download-ppt', {
        method: 'POST',
        body: JSON.stringify({ csvData }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PowerPoint');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'downtime-analysis-report.pptx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Error downloading PowerPoint:', error);
      alert('Error generating PowerPoint report. Please try again.');
    }
  });

  const handleDownloadPPT = () => {
    if (!csvData.trim() && !processedData) {
      alert('Please enter CSV data or upload an Excel file first');
      return;
    }
    // For Excel uploaded data, we'll use a placeholder since we don't have the original CSV
    const dataToSend = csvData.trim() || 'Excel file data processed';
    downloadPowerPoint.mutate(dataToSend);
  };

  // Excel file upload mutation
  const uploadExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload Excel file');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setProcessedData(data);
      // Also set the CSV data for other operations like PowerPoint export
      setCsvData('Excel file uploaded - data processed');
    },
    onError: (error) => {
      console.error('Error uploading Excel file:', error);
      alert('Error uploading Excel file. Please check the format and try again.');
    }
  });

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadExcelMutation.mutate(file);
    }
  };

  const triggerExcelUpload = () => {
    fileInputRef.current?.click();
  };

  const defaultCsvData = `8-Aug-25      Issue with Transfer Money and Credit Card Bill Payment  TRANSFER MONEY  Transfer Money and CCBP services        FULL    UNPLANNED       YES     11:00 PM        11:59 PM        0:59:00 EXTERNAL        SSL Limit Issue Resolved by SSL N/A     EXTERNAL        Prattay
6-Aug-25        Delayed response in Web Portals         WEB     Delayed response in CC, SYS & DMS portals       PARTIAL UNPLANNED       NO      2:23 PM 2:26 PM 0:03:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    APP     App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    ADD MONEY       App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    BILL PAYMENT    App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    MOBILE RECHARGE App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    RESUBMIT KYC    App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    REGISTRATION    App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
6-Aug-25        Delayed App Response    TRANSFER MONEY  App Services    PARTIAL UNPLANNED       NO      1:39 PM 2:56 PM 1:17:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Prattay
4-Aug-25        Delayed response in Web Portals         WEB     Delayed response in CC, SYS & DMS portals       PARTIAL UNPLANNED       NO      12:34 PM        1:53 PM 1:19:00 INTERNAL        Unidentified    Unidentified    N/A     SYSTEM  Borno
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     APP     All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     ADD MONEY       All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     BILL PAYMENT    All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     E-COM PAYMENT   All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     MOBILE RECHARGE All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     SMS     All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     TRANSFER MONEY  All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     REMITTANCE      All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     WEB     All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     USSD    All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     REGISTRATION    All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir
3-Aug-25        Full DFS System Down Due To DB Maintenance Activity     RESUBMIT KYC    All Service     FULL    PLANNED NO      12:10 AM        4:00 AM 3:50:00 INTERNAL        LIVE DB ACTIVITY - Database Purging July 2025   Maintenance Activity Successful N/A     DATABASE        Tanvir`;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Downtime Analysis Dashboard</h1>
            <p className="dashboard-subtitle">Comprehensive system downtime tracking and analysis</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="input-section">
        <h3>Data Input</h3>
        <textarea
          className="csv-textarea"
          placeholder="Paste your tab-separated downtime data here...&#10;Format: Date  Issue   Channel Service Impact Type     Modality        Start Time      End Time        Duration"
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
        />
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleProcess}
            disabled={processMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Analyze Downtime Data
              </>
            )}
          </Button>
          
          <Button
            onClick={triggerExcelUpload}
            disabled={uploadExcelMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploadExcelMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel File
              </>
            )}
          </Button>
          
          {(csvData || processedData) && (
            <Button
              onClick={handleDownloadPPT}
              disabled={downloadPowerPoint.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {downloadPowerPoint.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PowerPoint Report
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Hidden file input for Excel upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          style={{ display: 'none' }}
        />
        
        {!csvData && (
          <div className="mt-3">
            <Button
              onClick={() => setCsvData(defaultCsvData)}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Sample Data
            </Button>
          </div>
        )}
      </div>

      {processedData && (
        <div id="resultsSection">
          <OverallSummaryChart 
            summary={processedData.summary} 
            chartData={processedData.chartData} 
          />

          <DowntimeCharts chartData={processedData.chartData} />

          <IncidentTable incidents={processedData.incidents} />

          <ReliabilityReport reliabilityData={processedData.reliabilityData} />

          <WeeklyReports currentData={processedData} csvData={csvData} />
        </div>
      )}
    </div>
  );
}
