import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from "@/contexts/AlertContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

type Disease = {
  id: number;
  name: string;
  probability: number;
  date: string;
  location: string;
  details: string;
};

const DashboardStats = () => {
  const { alerts } = useAlerts();

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [donorCounts, setDonorCounts] = useState({
    totalDonors: 0,
    bloodDonors: 0,
    organDonors: 0,
  });
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [diseasesRes, donorCountRes, alertCountRes] = await Promise.all([
          axios.get("http://localhost:5000/api/diseases", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/donorcount", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/alerts/count", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);
  
        setDiseases(diseasesRes.data.diseases || []);
        setDonorCounts(donorCountRes.data);
        setActiveAlertCount(alertCountRes.data.activeAlertCount);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
  
    fetchDashboardData();
  }, []);
  

  const activeAlerts = alerts.filter(alert => alert.active).length;
  const totalPredictions = diseases.length;

  const diseaseData = diseases
    .slice(0, 5)
    .map(disease => ({
      name: disease.name,
      probability: Math.round(disease.probability * 100),
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
     <Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-medium">Active Alerts</CardTitle>
    <CardDescription>Current health warnings</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-health-600">{activeAlertCount}</div>
  </CardContent>
</Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Disease Predictions</CardTitle>
          <CardDescription>ML model outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-health-600">{totalPredictions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Total Donors</CardTitle>
          <CardDescription>Registered volunteers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-health-600">{donorCounts.totalDonors}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Donor Types</CardTitle>
          <CardDescription>Blood / Organ donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            <span className="text-red-500">{donorCounts.bloodDonors}</span>
            <span className="text-muted-foreground mx-2">/</span>
            <span className="text-indigo-500">{donorCounts.organDonors}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Disease Prediction Probabilities</CardTitle>
          <CardDescription>Top predicted diseases by our ML model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Probability']}
                  labelFormatter={(name) => `Disease: ${name}`}
                />
                <Bar dataKey="probability" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
