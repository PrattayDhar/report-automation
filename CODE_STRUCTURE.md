# Downtime Analysis Dashboard - Code Structure Guide

## 📁 Project Overview

This is a full-stack TypeScript application built with React (frontend) and Express.js (backend) for analyzing system downtime data. The application processes CSV/Excel files and generates comprehensive reports with charts and PowerPoint presentations.

## 🏗️ Architecture Pattern

**Frontend**: React + TypeScript + Vite (SPA - Single Page Application)
**Backend**: Express.js + TypeScript + In-memory processing
**Database**: PostgreSQL (configured but using in-memory storage currently)
**Styling**: Tailwind CSS + shadcn/ui components

---

## 📂 Directory Structure

```
├── 📁 client/                     # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📁 ui/             # shadcn/ui base components
│   │   │   │   ├── button.tsx     # Button component with variants
│   │   │   │   ├── card.tsx       # Card layout components
│   │   │   │   ├── form.tsx       # Form components with validation
│   │   │   │   └── toaster.tsx    # Toast notification system
│   │   │   ├── DowntimeCharts.tsx # Chart.js visualizations
│   │   │   ├── IncidentTable.tsx  # Expandable incident data table
│   │   │   ├── LoadingSpinner.tsx # Custom loading animation with logo
│   │   │   ├── OverallSummaryChart.tsx # Summary metrics display
│   │   │   ├── ReliabilityReport.tsx # Channel reliability metrics
│   │   │   ├── SummaryCards.tsx   # Dashboard metric cards
│   │   │   ├── WeeklyReports.tsx  # Weekly analysis features
│   │   │   └── WeeklyTrends.tsx   # Historical trend analysis
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   │   ├── use-mobile.tsx     # Mobile device detection
│   │   │   └── use-toast.ts       # Toast notification hook
│   │   ├── 📁 lib/                # Utility libraries
│   │   │   ├── dataProcessor.ts   # CSV parsing and data transformation
│   │   │   ├── queryClient.ts     # TanStack Query configuration
│   │   │   └── utils.ts           # Helper functions (cn, etc.)
│   │   ├── 📁 pages/              # Route components
│   │   │   ├── home.tsx           # Landing page with navigation
│   │   │   ├── dashboard.tsx      # Main analysis dashboard
│   │   │   └── not-found.tsx      # 404 error page
│   │   ├── 📁 assets/             # Static assets
│   │   │   └── logo.png           # Application logo for spinner
│   │   ├── App.tsx                # Main app with routing
│   │   ├── main.tsx               # React DOM entry point
│   │   └── index.css              # Global styles + Tailwind
│   └── index.html                 # HTML template
├── 📁 server/                     # Backend Express application
│   ├── index.ts                   # Server entry point + middleware
│   ├── routes.ts                  # API endpoints definition
│   ├── storage.ts                 # Data storage interface + in-memory impl
│   └── vite.ts                    # Development server integration
├── 📁 shared/                     # Shared TypeScript schemas
│   └── schema.ts                  # Zod schemas for data validation
├── 📁 attached_assets/            # User uploaded files
├── vite.config.ts                 # Vite build configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── drizzle.config.ts              # Database ORM configuration
├── package.json                   # Dependencies and scripts
└── replit.md                      # Project documentation + preferences
```

---

## 🔄 Data Flow Architecture

### 1. **Frontend Data Flow**
```
User Upload → Dashboard → TanStack Query → API Request → Backend Processing → Response → State Update → UI Render
```

### 2. **Backend Processing Flow**
```
CSV/Excel Input → Storage.processDowntimeData() → Data Parsing → Categorization → Chart Data Generation → Response
```

### 3. **PowerPoint Generation Flow**
```
Processed Data → PptxGenJS → Chart Creation → Table Generation → Slide Assembly → Binary Response → File Download
```

---

## 🧩 Key Components Deep Dive

### **Frontend Components**

#### **1. Home Page (`client/src/pages/home.tsx`)**
- **Purpose**: Landing page with feature showcase and navigation
- **Features**: Logo display, feature cards, main CTA button
- **Navigation**: Routes to `/dashboard` for main functionality

#### **2. Dashboard (`client/src/pages/dashboard.tsx`)**
- **Purpose**: Main analysis interface
- **State Management**: 
  - `csvData`: Raw input data
  - `processedData`: Analyzed results from backend
- **Key Features**:
  - CSV text input with sample data loading
  - Excel file upload with drag-drop
  - Real-time data processing with loading states
  - PowerPoint report generation
- **API Interactions**:
  - `POST /api/process-downtime` - Process CSV data
  - `POST /api/upload-excel` - Handle Excel files
  - `POST /api/download-ppt` - Generate PowerPoint

#### **3. Incident Table (`client/src/components/IncidentTable.tsx`)**
- **Purpose**: Display incident data with channel grouping
- **Key Features**:
  - Groups incidents by date+time+issue
  - Expandable "+more" functionality for channel lists
  - State management for expanded rows
  - Impact type and modality badges

#### **4. Loading Spinner (`client/src/components/LoadingSpinner.tsx`)**
- **Purpose**: Branded loading animation
- **Features**: Custom logo rotation, size variants (sm/md/lg)
- **Usage**: Integrated into all async operations

#### **5. Charts (`client/src/components/DowntimeCharts.tsx`)**
- **Purpose**: Data visualization with Chart.js
- **Chart Types**: Pie charts for impact/modality breakdown
- **Data Source**: Processed chart data from backend

### **Backend Components**

#### **1. Server (`server/index.ts`)**
- **Purpose**: Express server setup and middleware
- **Key Features**:
  - Request/response logging
  - JSON parsing middleware
  - Error handling middleware
  - Vite integration for development
  - Production static file serving

#### **2. Routes (`server/routes.ts`)**
- **Purpose**: API endpoint definitions
- **Endpoints**:
  - `POST /api/process-downtime` - Main data processing
  - `POST /api/upload-excel` - Excel file handling with multer
  - `POST /api/download-ppt` - PowerPoint generation
  - `POST /api/weekly-reports` - Weekly analysis storage
  - `GET /api/weekly-reports` - Retrieve stored reports
  - `DELETE /api/weekly-reports/:id` - Remove reports

#### **3. Storage (`server/storage.ts`)**
- **Purpose**: Data processing and storage interface
- **Key Functions**:
  - `processDowntimeData()`: Parse CSV and generate insights
  - `saveWeeklyReport()`: Store weekly analysis
  - `getWeeklyReports()`: Retrieve historical data
- **Implementation**: In-memory storage with full processing logic

#### **4. Schemas (`shared/schema.ts`)**
- **Purpose**: Type safety and validation
- **Key Schemas**:
  - `downtimeIncidentSchema`: Individual incident structure
  - `processedDataSchema`: Complete analysis results
  - `weeklyReportSchema`: Weekly report structure
  - `reliabilityDataSchema`: Channel reliability metrics

---

## 🔧 Configuration Files

### **1. Vite Configuration (`vite.config.ts`)**
- **Purpose**: Build tool configuration
- **Features**:
  - React plugin integration
  - Path aliases (`@/`, `@shared/`)
  - Asset handling for attached files
  - Development server settings

### **2. Tailwind Configuration (`tailwind.config.ts`)**
- **Purpose**: CSS framework setup
- **Features**:
  - shadcn/ui integration
  - Custom color variables
  - Typography plugin
  - Animation extensions

### **3. TypeScript Configuration (`tsconfig.json`)**
- **Purpose**: TypeScript compiler settings
- **Features**:
  - Modern ES modules
  - Strict type checking
  - Path mapping for imports
  - JSX transformation

---

## 🚀 Development Workflow

### **1. Local Development**
```bash
npm run dev          # Start development server (cross-env for Windows)
npm run check        # TypeScript type checking
npm run build        # Production build
npm run start        # Run production build
```

### **2. Package Management**
- **Frontend**: React, TanStack Query, Chart.js, shadcn/ui
- **Backend**: Express, multer, PptxGenJS, XLSX
- **Shared**: Zod validation, TypeScript
- **Build**: Vite, esbuild, cross-env

### **3. State Management Pattern**
```typescript
// TanStack Query for server state
const processMutation = useMutation({
  mutationFn: processDowntimeData,
  onSuccess: (data) => setProcessedData(data),
  onError: (error) => handleError(error)
});

// Local state for UI interactions
const [csvData, setCsvData] = useState('');
const [expandedRows, setExpandedRows] = useState(new Set());
```

---

## 🎯 Key Features Implementation

### **1. File Upload Processing**
- **CSV**: Direct text input with parsing
- **Excel**: File upload → Buffer → XLSX parsing → TSV conversion
- **Validation**: Zod schema validation on backend

### **2. Data Analysis Pipeline**
```
Raw Data → Parse Incidents → Calculate Durations → Group by Categories → Generate Charts → Reliability Metrics
```

### **3. PowerPoint Generation**
- **Library**: PptxGenJS for presentation creation
- **Slides**: Title, Summary, Charts, Reliability Table, Incidents
- **Charts**: Pie charts (planned vs unplanned), Bar charts (channel breakdown)
- **Tables**: Reliability metrics with proper formatting

### **4. Responsive Design**
- **Mobile Detection**: Custom hook for responsive behavior
- **Tailwind Classes**: Responsive breakpoints throughout
- **Component Variants**: Button sizes, card layouts adapt to screen size

---

## 🔍 Debugging and Troubleshooting

### **1. Common Issues**
- **Windows Environment**: Use `cross-env` for NODE_ENV variables
- **File Paths**: Use relative paths, avoid absolute references
- **TypeScript Errors**: Check LSP diagnostics with appropriate tools
- **Build Issues**: Verify Vite configuration and path aliases

### **2. Logging and Monitoring**
- **Server Logs**: Request/response logging in development
- **Client Errors**: Browser console for React errors
- **Network**: Check API responses in browser dev tools

### **3. Performance Optimization**
- **Code Splitting**: Route-based with React.lazy (if needed)
- **State Management**: TanStack Query caching
- **Bundle Analysis**: Vite build analyzer available

---

## 🛠️ Extension Points

### **1. Database Integration**
- **Current**: In-memory storage
- **Future**: Drizzle ORM with PostgreSQL configured
- **Migration**: Update storage interface, add persistence

### **2. Authentication**
- **Current**: Open access
- **Future**: Add user management, session handling
- **Integration**: Express-session and passport configured

### **3. Additional Features**
- **Real-time Updates**: WebSocket support available
- **Export Formats**: Additional report formats
- **Advanced Analytics**: Machine learning integration points

---

This structure provides a comprehensive foundation for understanding and extending the downtime analysis application. Each component is designed to be modular and maintainable, following modern web development best practices.