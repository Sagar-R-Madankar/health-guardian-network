
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useDonors, Donor } from "@/contexts/DonorContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User } from "lucide-react";

const contactSchema = z.object({
  bloodType: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  emergencyLevel: z.enum(["normal", "urgent", "critical"], {
    required_error: "Please select an emergency level"
  })
});

type ContactFormValues = z.infer<typeof contactSchema>;

const DonorContact = () => {
  const { user } = useAuth();
  const { findNearestDonors, contactDonor } = useDonors();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [nearestDonors, setNearestDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      bloodType: "",
      message: "",
      emergencyLevel: "normal"
    }
  });

  const searchDonors = (bloodType?: string) => {
    if (!user?.location) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Your location is needed to find nearby donors"
      });
      return;
    }

    setIsSearching(true);
    try {
      // Use the user's location to find nearest donors
      const donors = findNearestDonors(user.location, bloodType);
      setNearestDonors(donors);
      
      if (donors.length === 0) {
        toast({
          variant: "destructive",
          title: "No donors found",
          description: bloodType 
            ? `No donors with blood type ${bloodType} found nearby` 
            : "No donors found in your area"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Error finding nearby donors"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (!selectedDonor) {
      toast({
        variant: "destructive",
        title: "No donor selected",
        description: "Please select a donor to contact"
      });
      return;
    }

    setIsSending(true);
    try {
      // Prepare the message with emergency level
      const formattedMessage = `[${data.emergencyLevel.toUpperCase()}] ${data.message}`;
      
      // Contact the donor
      await contactDonor(selectedDonor.id, formattedMessage);
      
      toast({
        title: "Message sent",
        description: `Emergency message sent to ${selectedDonor.name}`
      });
      
      // Reset form and selection
      form.reset();
      setSelectedDonor(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "There was an error contacting the donor"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Nearby Donors</CardTitle>
        <CardDescription>
          Find and contact donors based on blood type and location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Search for Donors</h3>
            <div className="flex gap-4">
              <Select 
                onValueChange={(value) => form.setValue("bloodType", value)}
                value={form.watch("bloodType")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Any blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any blood type</SelectItem>
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
              
              <Button 
                variant="secondary" 
                onClick={() => searchDonors(form.watch("bloodType"))}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Find Donors"}
              </Button>
            </div>
          </div>

          {nearestDonors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Nearest Donors</h3>
              <div className="space-y-3">
                {nearestDonors.map((donor) => (
                  <div 
                    key={donor.id} 
                    className={`p-4 rounded-lg border cursor-pointer hover:bg-secondary/50 ${
                      selectedDonor?.id === donor.id ? 'bg-secondary border-primary' : ''
                    }`}
                    onClick={() => setSelectedDonor(donor)}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{donor.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{donor.bloodType}</Badge>
                        {donor.organDonor && (
                          <Badge className="bg-indigo-500">Organ Donor</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{donor.email}</span>
                      </div>
                      {donor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{donor.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {donor.location.address || "Location available"} 
                          {donor.distance && ` (${donor.distance.toFixed(1)} km away)`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDonor && (
            <>
              <Separator />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select emergency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message to Donor</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explain the emergency situation and requirements..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide clear details about the emergency and required donation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </>
          )}
        </div>
      </CardContent>
      {selectedDonor && (
        <CardFooter>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSending} 
            className="w-full"
          >
            {isSending ? "Sending..." : `Contact ${selectedDonor.name}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DonorContact;
