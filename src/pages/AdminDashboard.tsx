
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AlertsList from "@/components/dashboard/AlertsList";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link to="/admin/predictions">
                Run Prediction
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/alerts">
                Manage Alerts
              </Link>
            </Button>
          </div>
        </div>
        
        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AlertsList />
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Administrative tools and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/admin/predictions">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10Z" />
                      <path d="M16.93 17.82A9.9 9.9 0 0 1 12 20a9.9 9.9 0 0 1-4.93-2.18" />
                      <path d="M15.73 15.73A6 6 0 0 0 16 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4 6 6 0 0 0 .27 3.73" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    Run Disease Prediction Model
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/admin/alerts">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    Create New Alert
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/admin/donors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Contact Nearby Donors
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Health Guardian Network system information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">ML Model Status</span>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Status</span>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alert System</span>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Data Update</span>
                  <span className="text-sm text-muted-foreground">2025-04-22 08:15</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
