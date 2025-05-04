
import React, { createContext, useState, useContext, useEffect } from 'react';

export type Donor = {
  id: string;
  name: string;
  email: string;
  bloodType: string;
  organDonor: boolean;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  phone?: string;
  lastDonation?: string;
  distance?: number; // calculated field for sorting
};

type DonorContextType = {
  donors: Donor[];
  loading: boolean;
  addDonor: (donor: Omit<Donor, 'id'>) => void;
  findNearestDonors: (bloodType?: string, limit?: number) => Promise<Donor[]>; // ← fix here
  contactDonor: (donorId: string, message: string) => Promise<void>;
};

const DonorContext = createContext<DonorContextType | undefined>(undefined);

// Mock data


export const DonorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donors, setDonors] = useState<Donor[]>();
  const [loading, setLoading] = useState(false);

  // Load donors from localStorage on mount
   const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }
  
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          reject("Location permission denied or error occurred");
        }
      );
    });
  };
  
  useEffect(() => {
    
    const savedDonors = localStorage.getItem('donors');
    if (savedDonors) {
      setDonors(JSON.parse(savedDonors));
    }
  }, []);

  // Save donors to localStorage when they change
  useEffect(() => {
    localStorage.setItem('donors', JSON.stringify(donors));
  }, [donors]);

  const addDonor = (donorData: Omit<Donor, 'id'>) => {
    const newDonor: Donor = {
      ...donorData,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    setDonors([...donors, newDonor]);
  };

  // Haversine formula to calculate distance between two points
    const getDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const findNearestDonors = async (
    bloodType?: string,
    limit: number = 5
  ): Promise<Donor[]> => {
    try {
      const userLocation = await getUserLocation();
  
      const queryParams = new URLSearchParams();
      if (bloodType) queryParams.append("bloodType", bloodType);
      console.log("Token", localStorage.getItem("token"));
  
      const res = await fetch(`/api/donors?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const text = await res.text(); // Get raw response
console.log("Raw Response:", text);

  
const data = JSON.parse(text); // ✅ Now it's a JS object
console.log("Parsed Data:", data);
      
      if (!res.ok) throw new Error(data.message || "Error fetching donors");
  
      const donorsWithDistance = data.donors.map((donor: Donor) => {
        const distance = getDistanceInKm(
          userLocation.lat,
          userLocation.lng,
          donor.location.lat,
          donor.location.lng
        );
        return { ...donor, distance };
      });
  
      donorsWithDistance.sort((a, b) => a.distance - b.distance);
      return donorsWithDistance.slice(0, limit);
  
    } catch (error) {
      console.error("Error finding donors:", error);
      throw error;
    }
  };
  

  const contactDonor = async (donorId: string, message: string): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // or however you're storing the JWT
  
      const response = await fetch(`http://localhost:8080/api/donors/${donorId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // 🔑 Attach token here
        },
        body: JSON.stringify({ message }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to contact donor');
      }
  
      console.log(`Successfully sent message to donor ${donorId}`);
    } catch (error) {
      console.error('Error contacting donor:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <DonorContext.Provider value={{
      donors,
      loading,
      addDonor,
      findNearestDonors,
      contactDonor
    }}>
      {children}
    </DonorContext.Provider>
  );
};

export const useDonors = () => {
  const context = useContext(DonorContext);
  if (!context) {
    throw new Error('useDonors must be used within a DonorProvider');
  }
  return context;
};
