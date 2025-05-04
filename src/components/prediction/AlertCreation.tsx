import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const alertSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  diseaseId: z.string({ required_error: "Please select a disease" }),
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Please select a severity level"
  })
});

type AlertFormValues = z.infer<typeof alertSchema>;

const AlertCreation = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diseases, setDiseases] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      message: "",
      severity: "medium",
      diseaseId: "" // Default value for diseaseId
    }
  });

  // Fetch diseases from the backend
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure token is fetched
        if (!token) {
          throw new Error("No authentication token found");
        }
  
        const response = await axios.get("http://localhost:5000/api/diseases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Ensure disease IDs are treated as strings
        const diseases = response.data.diseases.map((disease: { id: number | string, name: string }) => ({
          id: String(disease.id), // Convert to string if it's not already
          name: disease.name,
        }));
  
        setDiseases(diseases); // Set the state with string IDs
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load diseases from the server"
        });
      }
    };
  
    fetchDiseases();
  }, []);

  const onSubmit = async (data: AlertFormValues) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token"); // Assuming token is stored here after login

      const response = await axios.post(
        "http://localhost:5000/api/alerts",
        {
          title: data.title,
          message: data.message,
          diseaseId: data.diseaseId, // Send selected disease ID
          severity: data.severity,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      toast({
        title: "Alert created",
        description: "Health alert has been issued successfully"
      });

      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create alert",
        description: error.message || "There was an error creating the alert"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Generate Health Alert</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
  control={form.control}
  name="diseaseId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Select Disease</FormLabel>
      <Select value={field.value} onValueChange={field.onChange} key={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue>
              {field.value 
                ? diseases.find(disease => disease.id === field.value)?.name
                : "Select a disease from the list"}
            </SelectValue>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {diseases.map((disease) => (
            <SelectItem key={disease.id} value={disease.id}>
              {disease.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormDescription>
        Choose from the available diseases
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
<FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dengue Fever Alert" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a clear, concise title for the alert
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the alert and recommended precautions..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Include important details and prevention measures
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Severity Level</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Low - Monitoring recommended
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Medium - Increased vigilance needed
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          High - Immediate action required
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          

          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || diseases.length === 0} className="w-full">
          {isSubmitting ? "Creating Alert..." : "Issue Health Alert"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlertCreation;
