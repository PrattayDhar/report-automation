# Downtime Analysis Dashboard

A comprehensive web application for tracking, analyzing, and visualizing system downtime incidents with PowerPoint reporting and weekly trend analysis capabilities.

## Features

- 📊 **Real-time Data Processing**: Upload CSV/TSV or Excel files with downtime data
- 📈 **Interactive Charts**: Pie charts showing downtime by category and channel
- 📋 **Detailed Reports**: Incident tables with comprehensive downtime information  
- 📑 **PowerPoint Export**: Generate professional presentation reports
- 📅 **Weekly Reports**: Save and compare weekly downtime analyses
- 📊 **MTD Summary**: Month-to-date aggregated downtime reporting
- 🔄 **Trend Analysis**: Week-over-week performance tracking

## Data Format

The system supports two input formats:

### Tab-Separated Values (TSV)
```
Date	Issue	Channel	Service	Impact	Modality	Blank	Start Time	End Time	Duration	Reason
24-Jul-25	System Down	MOBILE RECHARGE	All Service	FULL	UNPLANNED		2:30 PM	3:15 PM	0:45:00	Server Error
```

### Excel Files (.xlsx)
Upload Excel files with the same column structure as TSV format.

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Local Development

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd downtime-analysis-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Usage

### Basic Analysis
1. **Input Data**: Paste your downtime data in the text area or upload an Excel file
2. **Analyze**: Click "Analyze Downtime Data" to process the information
3. **Review Results**: View charts, summary tables, and incident details
4. **Export Report**: Download PowerPoint presentation with complete analysis

### Weekly Reports
1. **Save Reports**: After analysis, save data as weekly reports with date ranges
2. **View Trends**: Enable weekly trends to see patterns over time
3. **Compare Periods**: Select multiple weeks to compare performance
4. **MTD Summary**: View month-to-date aggregated statistics

### Chart Categories
- **Service Uptime**: Time when all services were operational
- **Planned Full**: Scheduled maintenance affecting all services
- **Planned Partial**: Scheduled maintenance affecting some services  
- **Unplanned Full**: Unexpected outages affecting all services
- **Unplanned Partial**: Unexpected outages affecting some services

## File Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utility functions
├── server/                # Backend Express server
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Data processing logic
├── shared/                # Shared TypeScript types
└── package.json          # Dependencies and scripts
```

## API Endpoints

- `POST /api/process-downtime` - Process downtime data
- `POST /api/download-ppt` - Generate PowerPoint report
- `GET /api/weekly-reports` - Get saved weekly reports
- `POST /api/weekly-reports` - Save weekly report
- `DELETE /api/weekly-reports/:id` - Delete weekly report
- `POST /api/upload-excel` - Upload Excel file

## Environment Variables

No environment variables are required for basic operation. The application uses in-memory storage by default.

## Deployment

### Replit Deployment
1. **Push to Replit**: Import your project to Replit
2. **Install Dependencies**: Run `npm install`
3. **Deploy**: Click the Deploy button in Replit interface
4. **Access**: Your app will be available at `https://your-repl-name.username.replit.app`

### Manual Deployment
1. **Build**: `npm run build`
2. **Deploy**: Upload built files to your hosting provider
3. **Start**: Run `npm start` on the server

## Troubleshooting

### Common Issues
- **Data not showing**: Ensure your data follows the correct tab-separated format
- **Charts empty**: Check that Impact and Modality columns contain FULL/PARTIAL and PLANNED/UNPLANNED values
- **PowerPoint not downloading**: Verify your browser allows file downloads

### Performance
- Large datasets (1000+ incidents) may take longer to process
- Weekly reports are stored in memory and reset on server restart

## Support

For issues and feature requests, please check the documentation or contact support.

## Version History

- **v1.0**: Initial release with basic downtime analysis
- **v1.1**: Added PowerPoint export functionality  
- **v1.2**: Weekly reports and trend analysis
- **v1.3**: MTD summaries and Excel upload support