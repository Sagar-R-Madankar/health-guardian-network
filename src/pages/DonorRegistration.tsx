
import Navbar from "@/components/layout/Navbar";
import DonorRegistration from "@/components/donors/DonorRegistration";

const DonorRegistrationPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Become a Donor</h1>
        <div className="max-w-xl mx-auto">
          <DonorRegistration />
        </div>
      </main>
    </div>
  );
};

export default DonorRegistrationPage;
