import type { ProcessedData } from "@shared/schema";
import { apiRequest } from "./queryClient";

export async function processDowntimeData(csvData: string): Promise<ProcessedData> {
  const response = await apiRequest("POST", "/api/process-downtime", { csvData });
  return await response.json();
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  return `${mins} minute${mins !== 1 ? 's' : ''}`;
}

export function generateChartColors(count: number): string[] {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56', '#9966FF'
  ];
  
  return colors.slice(0, count);
}
