import { useState } from "react";
import type { DowntimeIncident } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface IncidentTableProps {
  incidents: DowntimeIncident[];
}

export default function IncidentTable({ incidents }: IncidentTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Group incidents by unique incident (same date + time + issue)
  const uniqueIncidents = new Map<string, DowntimeIncident & { channels: string[] }>();
  
  incidents.forEach(incident => {
    const key = `${incident.date}-${incident.startTime}-${incident.endTime}-${incident.issue}`;
    if (!uniqueIncidents.has(key)) {
      uniqueIncidents.set(key, { ...incident, channels: [incident.channel] });
    } else {
      const existing = uniqueIncidents.get(key)!;
      if (!existing.channels.includes(incident.channel)) {
        existing.channels.push(incident.channel);
      }
    }
  });

  const uniqueIncidentList = Array.from(uniqueIncidents.values());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="dashboard-section">
      <h2>Detailed Incident Report</h2>
      <table className="incident-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Issue Description</th>
            <th>Affected Channels</th>
            <th>Impact Type</th>
            <th>Modality</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {uniqueIncidentList.map((incident, index) => (
            <tr key={index}>
              <td>{incident.date}</td>
              <td>{incident.issue}</td>
              <td>
                {incident.channels.length === 1 ? (
                  incident.channels[0]
                ) : incident.channels.length <= 3 ? (
                  incident.channels.join(', ')
                ) : (
                  <div className="flex items-center gap-2">
                    {expandedRows.has(index) ? (
                      <div className="flex flex-col gap-1">
                        <div>{incident.channels.join(', ')}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpanded(index)}
                          className="h-6 text-xs self-start"
                        >
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Show less
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{incident.channels.slice(0, 3).join(', ')}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpanded(index)}
                          className="h-6 text-xs text-blue-600 hover:text-blue-800"
                        >
                          +{incident.channels.length - 3} more
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td>
                <span className={`impact-badge ${incident.impactType === 'FULL' ? 'impact-full' : 'impact-partial'}`}>
                  {incident.impactType}
                </span>
              </td>
              <td>
                <span className={`impact-badge ${incident.modality === 'PLANNED' ? 'modality-planned' : 'modality-unplanned'}`}>
                  {incident.modality}
                </span>
              </td>
              <td>{incident.startTime}</td>
              <td>{incident.endTime}</td>
              <td>{incident.duration}</td>
              <td>{incident.reason || 'Unspecified'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
