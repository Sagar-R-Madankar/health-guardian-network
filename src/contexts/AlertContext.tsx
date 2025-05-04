
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
export type Disease = {
  id: string;
  name: string;
  probability: number;
  date: string;
  location?: string;
  details?: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  disease: Disease;
  severity: 'low' | 'medium' | 'high';
  date: string;
  active: boolean;
};

type AlertContextType = {
  alerts: Alert[];
  predictedDiseases: Disease[];
  loading: boolean;
  createAlert: (alert: Omit<Alert, 'id' | 'date'>) => void;
  dismissAlert: (id: string) => void;
  uploadPredictionData: (file: File) => Promise<Disease[]>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Mock data
const initialAlerts: Alert[] = [
  {
    id: '1',
    title: 'Dengue Fever Alert',
    message: 'Increasing cases of Dengue Fever detected in the area. Take precautions.',
    disease: {
      id: 'd1',
      name: 'Dengue Fever',
      probability: 0.85,
      date: '2025-04-15',
      location: 'Central District'
    },
    severity: 'high',
    date: '2025-04-16',
    active: true
  },
  {
    id: '2',
    title: 'Seasonal Flu Warning',
    message: 'Higher than normal flu rates predicted next month. Consider vaccination.',
    disease: {
      id: 'd2',
      name: 'Influenza A',
      probability: 0.72,
      date: '2025-04-10',
      location: 'Multiple Districts'
    },
    severity: 'medium',
    date: '2025-04-11',
    active: true
  }
];

const initialDiseases: Disease[] = [
  {
    id: 'd1',
    name: 'Dengue Fever',
    probability: 0.85,
    date: '2025-04-15',
    location: 'Central District',
    details: 'Vector-borne disease transmitted by mosquitoes'
  },
  {
    id: 'd2',
    name: 'Influenza A',
    probability: 0.72,
    date: '2025-04-10',
    location: 'Multiple Districts',
    details: 'Seasonal respiratory infection'
  },
  {
    id: 'd3',
    name: 'Gastroenteritis',
    probability: 0.64,
    date: '2025-04-05',
    location: 'Eastern Neighborhoods',
    details: 'Intestinal infection causing diarrhea and vomiting'
  }
];

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [predictedDiseases, setPredictedDiseases] = useState<Disease[]>(initialDiseases);
  const [loading, setLoading] = useState(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('alerts');
    const savedDiseases = localStorage.getItem('diseases');
    
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
    
    if (savedDiseases) {
      setPredictedDiseases(JSON.parse(savedDiseases));
    }
  }, []);

  // Save alerts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Save diseases to localStorage when they change
  useEffect(() => {
    localStorage.setItem('diseases', JSON.stringify(predictedDiseases));
  }, [predictedDiseases]);

  const createAlert = (alertData: Omit<Alert, 'id' | 'date'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    
    setAlerts([newAlert, ...alerts]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: false } : alert
    ));
  };

  const uploadPredictionData = async (file: File): Promise<Disease[]> => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      // Get the token (this depends on how you store your token, e.g., in localStorage or cookies)
      const token = localStorage.getItem('token');  // Replace with your actual token retrieval method
  
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      // Send the file to the backend with the authentication token
      const response = await axios.post('http://localhost:5000/api/predictions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Pass the token in the Authorization header
        },
      });
      console.log("Response after training",response)
      const predictedDiseases = response.data.predictions;
      setPredictedDiseases([...predictedDiseases, ...predictedDiseases]);
  
      return predictedDiseases;
    } catch (error) {
      console.error('Error uploading prediction data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <AlertContext.Provider value={{
      alerts,
      predictedDiseases,
      loading,
      createAlert,
      dismissAlert,
      uploadPredictionData
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
