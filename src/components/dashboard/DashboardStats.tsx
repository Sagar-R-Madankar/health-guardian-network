
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from "@/contexts/AlertContext";
import { useDonors } from "@/contexts/DonorContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardStats = () => {
  const { alerts, predictedDiseases } = useAlerts();
  const { donors } = useDonors();

  const activeAlerts = alerts.filter(alert => alert.active).length;
  const totalPredictions = predictedDiseases.length;
  const totalDonors = donors.length;
  const bloodDonors = donors.filter(donor => donor.bloodType).length;
  const organDonors = donors.filter(donor => donor.organDonor).length;

  const diseaseData = predictedDiseases
    .slice(0, 5)
    .map(disease => ({
      name: disease.name,
      probability: Math.round(disease.probability * 100)
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Active Alerts</CardTitle>
          <CardDescription>Current health warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-health-600">{activeAlerts}</div>
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
          <div className="text-3xl font-bold text-health-600">{totalDonors}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Donor Types</CardTitle>
          <CardDescription>Blood / Organ donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            <span className="text-red-500">{bloodDonors}</span>
            <span className="text-muted-foreground mx-2">/</span>
            <span className="text-indigo-500">{organDonors}</span>
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
