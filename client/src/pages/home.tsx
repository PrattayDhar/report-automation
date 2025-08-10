import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import logoImage from '../assets/logo.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="System Analytics" 
              className="w-16 h-16 mr-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              System Analytics Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive downtime analysis and system reliability reporting platform
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Data Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interactive charts and graphs for downtime patterns analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Week-over-week trends and reliability metrics tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <CardTitle className="text-lg">Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed incident categorization and impact assessment
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Real-time Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                CSV/Excel file processing with instant visualization
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Ready to Analyze Your System Data?
              </CardTitle>
              <CardDescription className="text-lg">
                Upload your downtime data and generate comprehensive reports with charts, insights, and PowerPoint presentations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Downtime Report
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Supports CSV and Excel file formats
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 System Analytics Dashboard. Built for comprehensive downtime analysis.</p>
        </div>
      </div>
    </div>
  );
}