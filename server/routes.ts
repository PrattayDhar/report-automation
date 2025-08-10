import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import PptxGenJS from "pptxgenjs";
import multer from 'multer';
import * as XLSX from 'xlsx';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files are allowed'));
      }
    }
  });

  app.post("/api/process-downtime", async (req, res) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({ error: "CSV data is required" });
      }

      const processedData = await storage.processDowntimeData(csvData);
      res.json(processedData);
    } catch (error) {
      console.error("Error processing downtime data:", error);
      res.status(500).json({ error: "Failed to process downtime data" });
    }
  });

  app.post("/api/weekly-reports", async (req, res) => {
    try {
      const { weekLabel, weekStart, weekEnd, csvData } = req.body;
      
      if (!weekLabel || typeof weekLabel !== 'string') {
        return res.status(400).json({ error: "Week label is required" });
      }
      
      if (!weekStart || !weekEnd) {
        return res.status(400).json({ error: "Week start and end dates are required" });
      }
      
      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({ error: "CSV data is required" });
      }

      const processedData = await storage.processDowntimeData(csvData);
      const weeklyReport = await storage.saveWeeklyReport(weekLabel, weekStart, weekEnd, processedData);
      res.json(weeklyReport);
    } catch (error) {
      console.error("Error saving weekly report:", error);
      res.status(500).json({ error: "Failed to save weekly report" });
    }
  });

  app.get("/api/weekly-reports", async (req, res) => {
    try {
      const reports = await storage.getWeeklyReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching weekly reports:", error);
      res.status(500).json({ error: "Failed to fetch weekly reports" });
    }
  });

  app.delete("/api/weekly-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWeeklyReport(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting weekly report:", error);
      res.status(500).json({ error: "Failed to delete weekly report" });
    }
  });

  // Excel file upload endpoint
  app.post("/api/upload-excel", upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Excel file is required" });
      }
      
      // Read the Excel file buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to TSV format
      const csvData = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
      
      // Process the data
      const processedData = await storage.processDowntimeData(csvData);
      res.json(processedData);
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });

  app.post("/api/download-ppt", async (req, res) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({ error: "CSV data is required" });
      }

      const processedData = await storage.processDowntimeData(csvData);
      
      // Create PowerPoint presentation
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      
      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.addText("Downtime Analysis Report", { 
        x: 1, y: 1, w: 8, h: 1.5, fontSize: 32, bold: true, color: "363636",
        align: "center"
      });
      titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, { 
        x: 1, y: 2.5, w: 8, h: 0.5, fontSize: 16, color: "666666",
        align: "center"
      });

      // Summary slide
      const summarySlide = pptx.addSlide();
      summarySlide.addText("Overall Downtime Summary", { 
        x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, color: "363636"
      });

      // Calculate totals for summary table - use summary data for actual time periods
      const serviceUptime = 10080 - processedData.summary.totalDuration;
      const unplannedPartialTotal = processedData.summary.unplannedPartialDuration;
      const unplannedFullTotal = processedData.summary.unplannedFullDuration;
      const plannedFullTotal = processedData.summary.plannedFullDuration;
      const plannedPartialTotal = processedData.summary.plannedPartialDuration;

      // Summary table as simple text
      summarySlide.addText("Category                   Duration (minutes)", { 
        x: 1, y: 2, w: 6, h: 0.5, fontSize: 14, bold: true, color: "363636",
        fontFace: "Courier New"
      });
      summarySlide.addText(`Service Uptime             ${serviceUptime.toLocaleString()}`, { 
        x: 1, y: 2.6, w: 6, h: 0.4, fontSize: 12, color: "28a745",
        fontFace: "Courier New"
      });
      summarySlide.addText(`Unplanned Partial          ${unplannedPartialTotal}`, { 
        x: 1, y: 3.0, w: 6, h: 0.4, fontSize: 12, color: "ffc107",
        fontFace: "Courier New"
      });
      summarySlide.addText(`Unplanned Full             ${unplannedFullTotal}`, { 
        x: 1, y: 3.4, w: 6, h: 0.4, fontSize: 12, color: "dc3545",
        fontFace: "Courier New"
      });
      summarySlide.addText(`Planned Full               ${plannedFullTotal}`, { 
        x: 1, y: 3.8, w: 6, h: 0.4, fontSize: 12, color: "007bff",
        fontFace: "Courier New"
      });
      summarySlide.addText(`Planned Partial            ${plannedPartialTotal}`, { 
        x: 1, y: 4.2, w: 6, h: 0.4, fontSize: 12, color: "6f42c1",
        fontFace: "Courier New"
      });

      // Key metrics
      const availability = (((serviceUptime) / (serviceUptime + processedData.summary.totalDuration)) * 100).toFixed(2);
      summarySlide.addText("Key Metrics", { 
        x: 1, y: 5.2, w: 6, h: 0.5, fontSize: 18, bold: true, color: "363636"
      });
      summarySlide.addText(`Total Downtime: ${Math.floor(processedData.summary.totalDuration / 60)}h ${processedData.summary.totalDuration % 60}m`, { 
        x: 1, y: 5.8, w: 6, h: 0.4, fontSize: 14, color: "666666"
      });
      summarySlide.addText(`Availability: ${availability}%`, { 
        x: 1, y: 6.3, w: 6, h: 0.4, fontSize: 14, color: "666666"
      });
      summarySlide.addText(`Planned vs Unplanned: ${processedData.summary.plannedDuration}min vs ${processedData.summary.unplannedDuration}min`, { 
        x: 1, y: 6.8, w: 6, h: 0.4, fontSize: 14, color: "666666"
      });

      // Overall Downtime Summary Chart Slide
      const overallSummarySlide = pptx.addSlide();
      overallSummarySlide.addText("Overall Downtime Summary", { 
        x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, color: "363636"
      });

      // Create pie chart data for Overall Summary (Planned vs Unplanned)
      const overallChartData = [
        {
          name: "Planned",
          labels: ["Planned"],
          values: [processedData.summary.plannedDuration]
        },
        {
          name: "Unplanned", 
          labels: ["Unplanned"],
          values: [processedData.summary.unplannedDuration]
        }
      ];

      // Add Overall Downtime Summary pie chart
      overallSummarySlide.addChart(pptx.ChartType.pie, overallChartData, {
        x: 2, y: 1.5, w: 5, h: 4,
        title: "Planned vs Unplanned Downtime Distribution",
        showTitle: true,
        showLegend: true,
        legendPos: 'r'
      });

      // Downtime Analysis by Category Slide
      const categorySlide = pptx.addSlide();
      categorySlide.addText("Downtime Analysis by Category", { 
        x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, color: "363636"
      });

      // Create category breakdown chart data
      const categoryChartData = [
        {
          name: "Unplanned Full",
          labels: ["Unplanned Full"],
          values: [processedData.summary.unplannedFullDuration]
        },
        {
          name: "Unplanned Partial", 
          labels: ["Unplanned Partial"],
          values: [processedData.summary.unplannedPartialDuration]
        },
        {
          name: "Planned Full",
          labels: ["Planned Full"], 
          values: [processedData.summary.plannedFullDuration]
        },
        {
          name: "Planned Partial",
          labels: ["Planned Partial"],
          values: [processedData.summary.plannedPartialDuration]
        }
      ];

      // Add Category Analysis pie chart
      categorySlide.addChart(pptx.ChartType.pie, categoryChartData, {
        x: 1, y: 1.5, w: 4.5, h: 4,
        title: "Breakdown by Impact Type and Modality",
        showTitle: true,
        showLegend: true,
        legendPos: 'r'
      });

      // Add channel breakdown bar chart on same slide
      const allChannels = Array.from(new Set([
        ...processedData.chartData.unplannedFull.map(d => d.channel),
        ...processedData.chartData.plannedFull.map(d => d.channel)
      ]));

      const channelBarData = [
        {
          name: "Unplanned Full",
          labels: allChannels,
          values: allChannels.map(channel => {
            const data = processedData.chartData.unplannedFull.find(d => d.channel === channel);
            return data ? data.duration : 0;
          })
        },
        {
          name: "Planned Full", 
          labels: allChannels,
          values: allChannels.map(channel => {
            const data = processedData.chartData.plannedFull.find(d => d.channel === channel);
            return data ? data.duration : 0;
          })
        }
      ];

      // Add Channel Analysis bar chart
      categorySlide.addChart(pptx.ChartType.bar, channelBarData, {
        x: 5.5, y: 1.5, w: 4, h: 4,
        title: "Channel-wise Downtime Minutes",
        showTitle: true,
        showLegend: true,
        legendPos: 'b',
        barDir: 'col'
      });

      // Reliability Report Slide with Charts
      const reliabilitySlide = pptx.addSlide();
      reliabilitySlide.addText("Reliability Report", { 
        x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, color: "363636"
      });

      // Create reliability chart data (Uptime percentages)
      const reliabilityChartData = [
        {
          name: "Channel Uptime %",
          labels: processedData.reliabilityData.map(d => d.channel),
          values: processedData.reliabilityData.map(d => d.uptimePercentage)
        }
      ];

      // Add Reliability bar chart
      reliabilitySlide.addChart(pptx.ChartType.bar, reliabilityChartData, {
        x: 0.5, y: 1.5, w: 9, h: 3.5,
        title: "Channel Reliability - Uptime Percentage",
        showTitle: true,
        showLegend: false,
        barDir: 'col',
        valAxisMajorUnit: 10
      });

      // Add reliability metrics table below chart
      const reliabilityTableRows = [
        ["Channel", "Uptime %", "Planned Down (min)", "Unplanned Down (min)", "Total Period (min)"]
      ];
      
      processedData.reliabilityData.forEach(data => {
        reliabilityTableRows.push([
          data.channel,
          `${data.uptimePercentage.toFixed(2)}%`,
          data.plannedDowntime.toString(),
          data.unplannedFullDowntime.toString(),
          data.totalMinutesInPeriod.toString()
        ]);
      });

      reliabilitySlide.addTable(reliabilityTableRows, {
        x: 0.5, y: 5.5, w: 9, h: 2,
        fontSize: 10,
        fontFace: "Arial",
        border: { pt: 1, color: "CFCFCF" },
        fill: { color: "F7F7F7" }
      });

      // Incidents details slide
      const incidentsSlide = pptx.addSlide();
      incidentsSlide.addText("Incident Details", { 
        x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, color: "363636"
      });

      // Incidents table as formatted text
      incidentsSlide.addText("Date        Issue                              Channel      Impact  Type       Duration", { 
        x: 0.5, y: 1.5, w: 9, h: 0.4, fontSize: 10, bold: true, color: "363636",
        fontFace: "Courier New"
      });
      
      // Limit to first 10 incidents to fit on slide
      const limitedIncidents = processedData.incidents.slice(0, 10);
      limitedIncidents.forEach((incident, index) => {
        const yPos = 2.0 + (index * 0.4);
        const issue = incident.issue.length > 30 ? incident.issue.substring(0, 30) + "..." : incident.issue;
        const line = `${incident.date.padEnd(12)}${issue.padEnd(35)}${incident.channel.padEnd(13)}${incident.impactType.padEnd(8)}${incident.modality.padEnd(11)}${incident.duration}`;
        incidentsSlide.addText(line, { 
          x: 0.5, y: yPos, w: 9, h: 0.35, fontSize: 9, color: "666666",
          fontFace: "Courier New"
        });
      });

      if (processedData.incidents.length > 10) {
        incidentsSlide.addText(`Showing first 10 of ${processedData.incidents.length} total incidents`, { 
          x: 0.5, y: 6.8, w: 9, h: 0.4, fontSize: 12, color: "666666",
          align: "center"
        });
      }

      // Generate PowerPoint file - use base64 then convert to buffer
      const pptxBase64 = await pptx.write({ outputType: 'base64' }) as string;
      const pptxBuffer = Buffer.from(pptxBase64, 'base64');
      
      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', 'attachment; filename="downtime-analysis-report.pptx"');
      res.setHeader('Content-Length', pptxBuffer.length);
      
      res.send(pptxBuffer);
    } catch (error) {
      console.error("Error generating PowerPoint:", error);
      res.status(500).json({ error: "Failed to generate PowerPoint report" });
    }
  });

  return httpServer;
}
