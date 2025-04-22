
import Navbar from "@/components/layout/Navbar";
import AlertCreation from "@/components/prediction/AlertCreation";
import AlertsList from "@/components/dashboard/AlertsList";

const AdminAlerts = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Alerts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AlertsList />
          </div>
          <div>
            <AlertCreation />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAlerts;
