import { type DowntimeIncident, type ProcessedData, type WeeklyReport, type ReliabilityData } from "@shared/schema";

export interface IStorage {
  processDowntimeData(csvData: string): Promise<ProcessedData>;
  saveWeeklyReport(weekLabel: string, weekStart: string, weekEnd: string, data: ProcessedData): Promise<WeeklyReport>;
  getWeeklyReports(): Promise<WeeklyReport[]>;
  deleteWeeklyReport(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private weeklyReports: WeeklyReport[] = [];
  async processDowntimeData(csvData: string): Promise<ProcessedData> {
    const lines = csvData.trim().split('\n');
    const incidents: DowntimeIncident[] = [];
    
    // Parse CSV data
    for (const line of lines) {
      const columns = line.split('\t');
      if (columns.length >= 10) {
        // Clean and normalize the impact type and modality values
        const impactType = columns[4].trim().toUpperCase();
        const modality = columns[5].trim().toUpperCase();
        
        // Debug logging to see what values we're getting
        console.log(`Parsing incident: Impact=${impactType}, Modality=${modality}, Channel=${columns[2]}, Duration=${columns[9]}`);
        
        incidents.push({
          date: columns[0],
          issue: columns[1],
          channel: columns[2],
          service: columns[3],
          impactType: impactType as 'FULL' | 'PARTIAL',
          modality: modality as 'PLANNED' | 'UNPLANNED',
          startTime: columns[7],
          endTime: columns[8],
          duration: columns[9],
          reason: columns[10] || 'Unspecified',
        });
      }
    }

    // Process and categorize data
    const chartData = this.categorizeIncidents(incidents);
    const summary = this.calculateSummary(incidents);
    const reliabilityData = this.calculateReliabilityData(incidents);

    return {
      summary,
      chartData,
      incidents,
      reliabilityData,
    };
  }

  private categorizeIncidents(incidents: DowntimeIncident[]) {
    // Maps to store aggregated duration by channel for each category
    const plannedFullMap = new Map<string, number>();
    const unplannedFullMap = new Map<string, number>();
    const plannedPartialMap = new Map<string, number>();
    const unplannedPartialMap = new Map<string, number>();

    // Group by incident (same date + time + issue) to avoid double counting time periods
    const incidentGroups = new Map<string, {
      duration: number;
      channels: Set<string>;
      modality: string;
      impactType: string;
    }>();
    
    incidents.forEach(incident => {
      const key = `${incident.date}-${incident.startTime}-${incident.endTime}-${incident.issue}`;
      if (!incidentGroups.has(key)) {
        incidentGroups.set(key, {
          duration: this.parseDuration(incident.duration),
          channels: new Set(),
          modality: incident.modality,
          impactType: incident.impactType
        });
      }
      incidentGroups.get(key)!.channels.add(incident.channel);
    });

    // Process each unique incident group - for chart data we need per-channel breakdown
    incidentGroups.forEach(group => {
      const { duration, channels, modality, impactType } = group;
      
      // For chart visualization, we want to show duration per channel affected
      channels.forEach(channel => {
        if (modality === 'PLANNED' && impactType === 'FULL') {
          plannedFullMap.set(channel, (plannedFullMap.get(channel) || 0) + duration);
        } else if (modality === 'UNPLANNED' && impactType === 'FULL') {
          unplannedFullMap.set(channel, (unplannedFullMap.get(channel) || 0) + duration);
        } else if (modality === 'PLANNED' && impactType === 'PARTIAL') {
          plannedPartialMap.set(channel, (plannedPartialMap.get(channel) || 0) + duration);
        } else if (modality === 'UNPLANNED' && impactType === 'PARTIAL') {
          unplannedPartialMap.set(channel, (unplannedPartialMap.get(channel) || 0) + duration);
        }
      });
    });

    // Convert maps to arrays
    const plannedFull = Array.from(plannedFullMap.entries()).map(([channel, duration]) => ({ channel, duration }));
    const unplannedFull = Array.from(unplannedFullMap.entries()).map(([channel, duration]) => ({ channel, duration }));
    const plannedPartial = Array.from(plannedPartialMap.entries()).map(([channel, duration]) => ({ channel, duration }));
    const unplannedPartial = Array.from(unplannedPartialMap.entries()).map(([channel, duration]) => ({ channel, duration }));

    return {
      plannedFull,
      unplannedFull,
      plannedPartial,
      unplannedPartial,
    };
  }

  private calculateSummary(incidents: DowntimeIncident[]) {
    // Deduplicate incidents by same date + time for duration calculation
    const uniqueIncidents = new Map<string, DowntimeIncident>();
    
    incidents.forEach(incident => {
      const key = `${incident.date}-${incident.startTime}-${incident.endTime}-${incident.issue}`;
      if (!uniqueIncidents.has(key)) {
        uniqueIncidents.set(key, incident);
      }
    });

    const uniqueIncidentList = Array.from(uniqueIncidents.values());
    let totalDuration = 0;
    let plannedDuration = 0;
    let unplannedDuration = 0;
    let plannedFullDuration = 0;
    let plannedPartialDuration = 0;
    let unplannedFullDuration = 0;
    let unplannedPartialDuration = 0;

    uniqueIncidentList.forEach(incident => {
      const duration = this.parseDuration(incident.duration);
      totalDuration += duration;
      
      if (incident.modality === 'PLANNED') {
        plannedDuration += duration;
        if (incident.impactType === 'FULL') {
          plannedFullDuration += duration;
        } else {
          plannedPartialDuration += duration;
        }
      } else {
        unplannedDuration += duration;
        if (incident.impactType === 'FULL') {
          unplannedFullDuration += duration;
        } else {
          unplannedPartialDuration += duration;
        }
      }
    });

    return {
      totalIncidents: uniqueIncidentList.length,
      totalDuration,
      plannedDuration,
      unplannedDuration,
      plannedFullDuration,
      plannedPartialDuration,
      unplannedFullDuration,
      unplannedPartialDuration,
    };
  }

  private parseDuration(durationStr: string): number {
    // Parse duration string like "3:50:00" to minutes
    const parts = durationStr.split(':');
    const hours = parseInt(parts[0] || '0');
    const minutes = parseInt(parts[1] || '0');
    return hours * 60 + minutes;
  }

  private calculateReliabilityData(incidents: DowntimeIncident[]): ReliabilityData[] {
    // Get all unique channels
    const channelSet = new Set(incidents.map(incident => incident.channel));
    const channels = Array.from(channelSet);
    
    // Assume analysis period is 1 week = 10080 minutes (7 days * 24 hours * 60 minutes)
    const totalMinutesInPeriod = 10080;
    
    return channels.map(channel => {
      const channelIncidents = incidents.filter(incident => incident.channel === channel);
      
      // Calculate planned downtime (both full and partial)
      let plannedDowntime = 0;
      let unplannedFullDowntime = 0;
      
      // Group incidents by unique time periods to avoid double counting
      const incidentGroups = new Map<string, {
        duration: number;
        modality: string;
        impactType: string;
      }>();
      
      channelIncidents.forEach(incident => {
        const key = `${incident.date}_${incident.startTime}_${incident.endTime}_${incident.issue}`;
        if (!incidentGroups.has(key)) {
          incidentGroups.set(key, {
            duration: this.parseDuration(incident.duration),
            modality: incident.modality,
            impactType: incident.impactType
          });
        }
      });
      
      // Calculate downtime by category
      incidentGroups.forEach(incident => {
        if (incident.modality === 'PLANNED') {
          plannedDowntime += incident.duration;
        } else if (incident.modality === 'UNPLANNED' && incident.impactType === 'FULL') {
          unplannedFullDowntime += incident.duration;
        }
      });
      
      // Calculate uptime percentage
      // Uptime = Total Period - Unplanned Full Downtime (planned downtime doesn't count against reliability)
      const uptimeMinutes = totalMinutesInPeriod - unplannedFullDowntime;
      const uptimePercentage = (uptimeMinutes / totalMinutesInPeriod) * 100;
      
      return {
        channel,
        plannedDowntime,
        unplannedFullDowntime,
        totalMinutesInPeriod,
        uptimePercentage: Math.round(uptimePercentage * 100) / 100, // Round to 2 decimal places
      };
    }).sort((a, b) => a.channel.localeCompare(b.channel));
  }

  async saveWeeklyReport(weekLabel: string, weekStart: string, weekEnd: string, data: ProcessedData): Promise<WeeklyReport> {
    const now = new Date();
    const id = `report_${Date.now()}`;
    
    const weeklyReport: WeeklyReport = {
      id,
      weekLabel,
      weekStart,
      weekEnd,
      createdAt: now.toISOString(),
      summary: data.summary,
    };

    this.weeklyReports.push(weeklyReport);
    return weeklyReport;
  }

  async getWeeklyReports(): Promise<WeeklyReport[]> {
    return [...this.weeklyReports].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteWeeklyReport(id: string): Promise<void> {
    const index = this.weeklyReports.findIndex(report => report.id === id);
    if (index > -1) {
      this.weeklyReports.splice(index, 1);
    }
  }
}

export const storage = new MemStorage();
