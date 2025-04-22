
import { useState } from "react";
import { useAlerts, Alert } from "@/contexts/AlertContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert as AlertComponent } from "@/components/ui/alert";
import { Info, Bell, X } from "lucide-react";

const AlertsList = () => {
  const { alerts, dismissAlert } = useAlerts();
  const [showAll, setShowAll] = useState(false);

  const activeAlerts = alerts.filter(alert => alert.active);
  const displayAlerts = showAll ? alerts : activeAlerts;

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-alert-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Health Alerts</CardTitle>
          <CardDescription>Disease outbreak notifications</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Active Only" : "Show All Alerts"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="mx-auto h-10 w-10 mb-2 opacity-20" />
            <p>No alerts to display</p>
          </div>
        ) : (
          displayAlerts.map(alert => (
            <AlertComponent key={alert.id} className={`${!alert.active && 'opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Info className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity} risk
                      </Badge>
                      {!alert.active && (
                        <Badge variant="outline">Dismissed</Badge>
                      )}
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span>Disease: {alert.disease.name}</span>
                      <span className="mx-2">•</span>
                      <span>Probability: {Math.round(alert.disease.probability * 100)}%</span>
                      <span className="mx-2">•</span>
                      <span>Issued: {formatDate(alert.date)}</span>
                    </div>
                  </div>
                </div>
                {alert.active && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => dismissAlert(alert.id)} 
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                )}
              </div>
            </AlertComponent>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList;
