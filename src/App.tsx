import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import { Toaster } from "react-hot-toast";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import LocomotiveScroll from "locomotive-scroll";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./components/ThemeProvider";
import { useJsApiLoader } from "@react-google-maps/api";
import { useAppDispatch } from "./redux/hooks";
import { setMapLoaded } from "./redux/features/Map/mapSlice";


const App = () => {
  const dispatch = useAppDispatch()
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {actualTheme} = useTheme()
  const [error, setError] = useState<string | null>(null);
 
  // Use a default API key if the environment variable is not set
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY || "YOUR_DEFAULT_API_KEY";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ["places"]
  });

  useEffect(()=>{
    dispatch(setMapLoaded({mapLoaded:isLoaded}))
  },[isLoaded])

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    try {
      const locomotiveScroll = new LocomotiveScroll({
        el: scrollContainerRef.current,
        smooth: true,
      });

      return () => {
        locomotiveScroll.destroy();
      };
    } catch (err) {
      console.error("Error initializing LocomotiveScroll:", err);
      setError("Error initializing smooth scroll");
    }
  }, []);

  const color = actualTheme === "dark" ? "white" : "black";
  const backgroundColor = actualTheme === "dark" ? "#100D12" : "#FFFBF0";
  const backgroundImage = actualTheme === "dark" ? "dark-background" : "light-background"

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={backgroundImage}
      ref={scrollContainerRef}
      style={{ backgroundColor, color }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <CustomCursor />
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
