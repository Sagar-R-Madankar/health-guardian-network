
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold text-primary">Health Guardian Network</div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 bg-gradient-to-b from-background to-secondary">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Protecting Communities Through Smart Health Monitoring
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Predict, alert, and respond to disease outbreaks with advanced AI-driven systems and community-based donor networks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" />
                    <circle cx="18" cy="18" r="3" />
                    <path d="m19.5 14.5-1.41 1.41" />
                    <path d="m16.5 19.5-1.41 1.41" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Disease Prediction</h3>
                <p className="text-muted-foreground">
                  Advanced machine learning models analyze health data to predict potential disease outbreaks before they become widespread.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M16 16v-3a3 3 0 0 0-3-3h-1" />
                    <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8" />
                    <line x1="2" y1="13" x2="10" y2="13" />
                    <line x1="6" y1="17" x2="6" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Emergency Alerts</h3>
                <p className="text-muted-foreground">
                  Real-time health alerts notify community members of potential disease outbreaks and provide preventive measures.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M20 4v5a7 7 0 0 1-7 7H4" />
                    <polyline points="4 11 11 4 18 11" />
                    <path d="M13 18a3 3 0 1 0 0-6m0 6v-6" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Donor Network</h3>
                <p className="text-muted-foreground">
                  Location-based donor matching connects those in need with nearby blood and organ donors using shortest path algorithms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Join the Health Guardian Network</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're a health administrator or community member, our platform provides the tools you need to protect public health and save lives.
              </p>
              <Link to="/register">
                <Button size="lg">Register Now</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Health Guardian Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
