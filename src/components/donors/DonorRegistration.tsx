
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useDonors } from "@/contexts/DonorContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const donorSchema = z.object({
  bloodType: z.string().min(1, { message: "Please select a blood type" }),
  organDonor: z.boolean().default(false),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Please enter your address" }),
});

type DonorFormValues = z.infer<typeof donorSchema>;

const DonorRegistration = () => {
  const { user, updateUserProfile } = useAuth();
  const { addDonor } = useDonors();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      bloodType: "",
      organDonor: false,
      phone: "",
      address: "",
    }
  });

  const onSubmit = async (data: DonorFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to register as a donor"
      });
      return;
    }
  
    setIsSubmitting(true);
  
    // First, get the user's location
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation"
      });
      setIsSubmitting(false);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
  
        try {
          const response = await fetch("http://localhost:5000/api/donors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              bloodType: data.bloodType,
              organDonor: data.organDonor,
              phone: data.phone,
              address: data.address,
              lat,
              lng,
            }),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            throw new Error(result.message || "Failed to register as donor");
          }
  
          // Update frontend profile
          updateUserProfile({
            isDonor: true,
            bloodType: data.bloodType,
            organDonor: data.organDonor,
          });
  
          setIsSuccess(true);
          toast({
            title: "Registration successful",
            description: "Thank you for registering as a donor"
          });

          window.location.reload();
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: (error as Error).message || "There was a problem registering you as a donor"
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Location error",
          description: "Unable to get your location. Please check your browser permissions."
        });
      }
    );
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Donor Registration Complete</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for registering as a donor. Your information has been added to our system.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
            >
              Update Donor Information
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register as Donor</CardTitle>
        <CardDescription>
          Provide your information to become a donor in the Health Guardian Network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your blood type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your phone number will only be used for emergency contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address" {...field} />
                  </FormControl>
                  <FormDescription>
                    This helps us find nearby donors in case of emergency
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organDonor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Organ Donor</FormLabel>
                    <FormDescription>
                      Register as an organ donor in addition to blood donation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? "Registering..." : "Register as Donor"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonorRegistration;
