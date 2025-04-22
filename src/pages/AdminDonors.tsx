
import Navbar from "@/components/layout/Navbar";
import DonorContact from "@/components/donors/DonorContact";

const AdminDonors = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Donor Management</h1>
        <DonorContact />
      </main>
    </div>
  );
};

export default AdminDonors;
