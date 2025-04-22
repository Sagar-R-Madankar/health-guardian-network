
import Navbar from "@/components/layout/Navbar";
import AlertsList from "@/components/dashboard/AlertsList";

const Alerts = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Health Alerts</h1>
        <AlertsList />
      </main>
    </div>
  );
};

export default Alerts;
