import { formatDuration } from "@/lib/dataProcessor";

interface SummaryCardsProps {
  summary: {
    totalIncidents: number;
    totalDuration: number;
    plannedDuration: number;
    unplannedDuration: number;
  };
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <h3>Total Incidents</h3>
        <div className="value">{summary.totalIncidents}</div>
        <div className="unit">incidents</div>
      </div>
      <div className="summary-card">
        <h3>Total Downtime</h3>
        <div className="value">{formatDuration(summary.totalDuration)}</div>
        <div className="unit"></div>
      </div>
      <div className="summary-card">
        <h3>Planned Downtime</h3>
        <div className="value">{formatDuration(summary.plannedDuration)}</div>
        <div className="unit"></div>
      </div>
      <div className="summary-card">
        <h3>Unplanned Downtime</h3>
        <div className="value">{formatDuration(summary.unplannedDuration)}</div>
        <div className="unit"></div>
      </div>
    </div>
  );
}
