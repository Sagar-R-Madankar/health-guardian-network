
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AlertsList from "@/components/dashboard/AlertsList";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const { user, setUserLocation } = useAuth();
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (!user?.location && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          setIsGettingLocation(true);
          navigator.geolocation.getCurrentPosition(
            position => {
              setUserLocation(position.coords.latitude, position.coords.longitude);
              setIsGettingLocation(false);
            },
            error => {
              console.error("Error getting location:", error);
              setIsGettingLocation(false);
            }
          );
        }
      });
    }
  }, [user, setUserLocation]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation(position.coords.latitude, position.coords.longitude);
          setIsGettingLocation(false);
          toast({
            title: "Location updated",
            description: "Your location has been successfully updated"
          });
        },
        error => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Unable to get your location. Please check your browser permissions."
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AlertsList />
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Location</CardTitle>
                <CardDescription>
                  Update your location to receive relevant alerts and enable donor matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.location ? (
                  <div className="text-center py-2">
                    <MapPin className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Location is set at coordinates:<br />
                      <span className="font-medium">
                        {user.location.lat.toFixed(6)}, {user.location.lng.toFixed(6)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No location set. Enable location sharing to improve your experience.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  {isGettingLocation ? "Getting location..." : "Update Location"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Become a Donor</CardTitle>
                <CardDescription>
                  Register as a blood or organ donor to help save lives
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-2">
                {user?.isDonor ? (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-red-500 mb-2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <p className="font-medium">
                      Thank you for being a donor!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.bloodType && `Blood Type: ${user.bloodType}`}
                      {user.bloodType && user.organDonor && ' | '}
                      {user.organDonor && 'Organ Donor'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-2 opacity-50">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      You are not registered as a donor yet.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  asChild
                  variant={user?.isDonor ? "outline" : "default"}
                  className="w-full"
                >
                  <Link to="/donor-registration">
                    {user?.isDonor ? "Update Donor Info" : "Register as Donor"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
