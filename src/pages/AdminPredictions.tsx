
import Navbar from "@/components/layout/Navbar";
import PredictionUpload from "@/components/prediction/PredictionUpload";
import AlertCreation from "@/components/prediction/AlertCreation";

const AdminPredictions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Disease Prediction</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PredictionUpload />
          <AlertCreation />
        </div>
      </main>
    </div>
  );
};

export default AdminPredictions;
