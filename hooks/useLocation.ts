import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  isLoading: boolean;
  permissionStatus: Location.PermissionStatus | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    isLoading: true,
    permissionStatus: null,
  });

  const requestPermission = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));
      
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          errorMsg: 'Permission to access location was denied',
          isLoading: false,
        }));
        return false;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setState(prev => ({
        ...prev,
        location,
        isLoading: false,
        errorMsg: null,
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errorMsg: 'Error getting location',
        isLoading: false,
      }));
      return false;
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    ...state,
    requestPermission,
  };
}