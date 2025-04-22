
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
  findNearestDonors: (location: {lat: number, lng: number}, bloodType?: string, limit?: number) => Donor[];
  contactDonor: (donorId: string, message: string) => Promise<void>;
};

const DonorContext = createContext<DonorContextType | undefined>(undefined);

// Mock data
const initialDonors: Donor[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    bloodType: 'O+',
    organDonor: true,
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '123 Main St, San Francisco, CA'
    },
    phone: '555-123-4567',
    lastDonation: '2025-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    bloodType: 'A-',
    organDonor: false,
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '456 Market St, San Francisco, CA'
    },
    phone: '555-987-6543',
    lastDonation: '2025-03-10'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    bloodType: 'B+',
    organDonor: true,
    location: {
      lat: 37.7694,
      lng: -122.4862,
      address: '789 Sunset Blvd, San Francisco, CA'
    },
    phone: '555-456-7890'
  }
];

export const DonorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [loading, setLoading] = useState(false);

  // Load donors from localStorage on mount
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
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const findNearestDonors = (
    location: {lat: number, lng: number}, 
    bloodType?: string, 
    limit: number = 5
  ): Donor[] => {
    // Filter donors by blood type if provided
    let filteredDonors = bloodType 
      ? donors.filter(donor => donor.bloodType === bloodType)
      : [...donors];
    
    // Calculate distance for each donor
    filteredDonors = filteredDonors.map(donor => ({
      ...donor,
      distance: calculateDistance(
        location.lat, 
        location.lng, 
        donor.location.lat, 
        donor.location.lng
      )
    }));
    
    // Sort by distance
    filteredDonors.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    // Return limited number of donors
    return filteredDonors.slice(0, limit);
  };

  const contactDonor = async (donorId: string, message: string): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would send a request to your Node.js backend
      // which would handle SMS/email notification
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Message sent to donor ${donorId}: ${message}`);
      // In production, this would update a notifications table in MySQL
      
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
