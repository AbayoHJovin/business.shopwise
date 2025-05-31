import { useState, useEffect, useCallback, useRef } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

const STORAGE_KEY = "shopwise_user_location";
const PERMISSION_PREFERENCE_KEY = "shopwise_location_permission_preference";

/**
 * Hook for handling geolocation functionality
 */
export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
    timestamp: null,
  });

  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [shouldGetCurrentPosition, setShouldGetCurrentPosition] =
    useState(false);

  // Check if the browser supports geolocation
  const isGeolocationSupported = "geolocation" in navigator;

  // Check if user has already interacted with the permission modal
  useEffect(() => {
    const permissionPreference = localStorage.getItem(
      PERMISSION_PREFERENCE_KEY
    );
    if (permissionPreference) {
      setPermissionRequested(true);

      // If the user previously clicked "Allow", flag that we should get position
      if (permissionPreference === "granted") {
        setShouldGetCurrentPosition(true);
      }
    }
  }, []);

  // Try to get saved location from storage
  useEffect(() => {
    const savedLocation = localStorage.getItem(STORAGE_KEY);
    if (savedLocation) {
      try {
        const { latitude, longitude, timestamp } = JSON.parse(savedLocation);

        // Check if the saved location is less than 24 hours old
        const isRecent =
          timestamp && Date.now() - timestamp < 24 * 60 * 60 * 1000;

        if (isRecent && latitude && longitude) {
          setState((prev) => ({
            ...prev,
            latitude,
            longitude,
            loading: false,
            timestamp,
          }));
        }
      } catch (error) {
        console.error("Error parsing saved location:", error);
      }
    }
  }, []);

  // Check for geolocation permissions
  useEffect(() => {
    if (!isGeolocationSupported) return;

    // Check if the Permissions API is supported
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state);

          // Listen for permission changes
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);

            // Store the new permission state in localStorage
            localStorage.setItem(
              PERMISSION_PREFERENCE_KEY,
              permissionStatus.state
            );
          };
        })
        .catch((error) => {
          console.error("Error checking geolocation permission:", error);
        });
    }
  }, [isGeolocationSupported]);

  /**
   * Get the current position
   */
  const getCurrentPosition = useCallback(() => {
    if (!isGeolocationSupported) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setPermissionRequested(true);

    // Save the user's preference to show they've interacted with the permission modal
    localStorage.setItem(PERMISSION_PREFERENCE_KEY, "granted");

    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Save location to localStorage with timestamp
        const locationData = {
          latitude,
          longitude,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));

        setState({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
          timestamp: Date.now(),
        });

        if (options.onSuccess) {
          options.onSuccess(position);
        }
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));

        // If permission is denied, save this preference
        if (error.code === 1) {
          // Permission denied
          localStorage.setItem(PERMISSION_PREFERENCE_KEY, "denied");
        }

        if (options.onError) {
          options.onError(error);
        }
      },
      {
        enableHighAccuracy: options.enableHighAccuracy || true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0,
      }
    );
  }, [isGeolocationSupported, options]);

  // Execute getCurrentPosition after it's been defined
  useEffect(() => {
    if (shouldGetCurrentPosition) {
      getCurrentPosition();
      setShouldGetCurrentPosition(false);
    }
  }, [shouldGetCurrentPosition, getCurrentPosition]);

  /**
   * Set a manual location
   */
  const setManualLocation = useCallback(
    (latitude: number, longitude: number) => {
      // Save location to localStorage with timestamp
      const locationData = {
        latitude,
        longitude,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));

      setState({
        latitude,
        longitude,
        accuracy: null,
        loading: false,
        error: null,
        timestamp: Date.now(),
      });
    },
    []
  );

  /**
   * Clear the saved location
   */
  const clearSavedLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: false,
      error: null,
      timestamp: null,
    });
  }, []);

  return {
    ...state,
    isGeolocationSupported,
    permissionState,
    permissionRequested,
    getCurrentPosition,
    setManualLocation,
    clearSavedLocation,
  };
};

export default useGeolocation;
