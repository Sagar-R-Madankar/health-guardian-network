import { useEffect, useState } from "react";
import axios from "axios";
import { useAlerts } from "@/contexts/AlertContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Upload } from "lucide-react";

type Disease = {
  id: number;
  name: string;
  probability: number;
  date: string;
  location?: string;
  details?: string;
};

const PredictionUpload = () => {
  const { uploadPredictionData } = useAlerts(); // You can keep this if still using upload
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [predictions, setPredictions] = useState<Disease[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a CSV file",
        });
        return;
      }

      setSelectedFile(file);
      setShowResults(false);
      setPredictions([]);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/diseases", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPredictions(res.data.diseases || []);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch predictions",
        description: "Something went wrong while retrieving data",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to upload",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadPredictionData(selectedFile);
      await fetchPredictions(); // fetch predictions after upload
      toast({
        title: "Prediction completed",
        description: "Predictions generated and loaded",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Prediction failed",
        description: "There was an error processing your data",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Disease Prediction Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            Upload a CSV file with disease occurrence data. Our machine learning model will analyze
            patterns and predict potential outbreaks based on historical data and current trends.
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Upload Dataset</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV file containing disease occurrence data
          </p>

          <div className="flex flex-col items-center gap-4">
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium bg-background hover:bg-muted"
            >
              Select CSV File
            </label>
            {selectedFile && (
              <div className="text-sm">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {showResults && predictions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Prediction Results</h3>
            <div className="space-y-3">
              {predictions.map((disease) => (
                <div key={disease.id} className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{disease.name}</h4>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {(disease.probability * 100).toFixed(1)}% probability
                    </span>
                  </div>
                  {disease.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Location: {disease.location}
                    </p>
                  )}
                  {disease.details && (
                    <p className="text-sm mt-2">{disease.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "Processing..." : "Run Prediction Model"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PredictionUpload;
