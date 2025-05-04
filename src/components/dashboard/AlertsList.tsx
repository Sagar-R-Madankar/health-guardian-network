import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert as AlertComponent } from "@/components/ui/alert";
import { Info, Bell, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Disease = {
  id: number;
  name: string;
  probability: number;
  location: string;
};

type Alert = {
  id: number;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  active: boolean;
  date: string;
  disease: Disease;
  createdBy: {
    id: number;
    name: string;
  };
};

const AlertsList = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "low" as "low" | "medium" | "high",
    active: true,
  });

  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      try {
        const parsed = JSON.parse(currentUser);
        console.log("Parsed currentUser:", parsed); // ✅ Check this in the browser console
        setUserRole(parsed.role); // This must be "admin" (case-sensitive)
      } catch (error) {
        console.error("Invalid user object in localStorage.");
      }
    }
  
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAlerts(res.data.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/alerts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Delete alert error:", error);
    }
  };

  const openEditModal = (alert: Alert) => {
    setForm({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      active: alert.active,
    });
    setEditingAlert(alert);
  };

  const handleUpdate = async () => {
    if (!editingAlert) return;
    try {
      await axios.put(
        `http://localhost:5000/api/alerts/${editingAlert.id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAlerts((prev) =>
        prev.map((a) => (a.id === editingAlert.id ? { ...a, ...form } : a))
      );
      setEditingAlert(null);
    } catch (error) {
      console.error("Update alert error:", error);
    }
  };

  const activeAlerts = alerts.filter((alert) => alert.active);
  const displayAlerts = showAll ? alerts : activeAlerts;

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-600 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Health Alerts</CardTitle>
          <CardDescription>Disease outbreak notifications</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
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
          displayAlerts.map((alert) => (
            <AlertComponent
              key={alert.id}
              className={`${!alert.active && "opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Info className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity} risk
                      </Badge>
                      {!alert.active && <Badge variant="outline">Dismissed</Badge>}
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span>Disease: {alert.disease.name}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Probability: {Math.round(alert.disease.probability * 100)}%
                      </span>
                      <span className="mx-2">•</span>
                      <span>Issued: {formatDate(alert.date)}</span>
                    </div>
                  </div>
                </div>
                {userRole === "admin" && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(alert)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Update</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </AlertComponent>
          ))
        )}
      </CardContent>

      <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div>
              <Label>Severity</Label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm({ ...form, severity: e.target.value as Alert["severity"] })
                }
                className="w-full border rounded px-2 py-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AlertsList;
