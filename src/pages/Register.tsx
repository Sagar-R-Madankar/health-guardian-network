
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Health Guardian Network</h1>
        <p className="mt-2 text-muted-foreground">Create a new account</p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register;
