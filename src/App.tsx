import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/EventCreate";
import EventList from "./pages/EventList";
import Users from "./pages/Users";
import Subscription from "./pages/Subscription";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import EventView from "./pages/EventView";
import EventEdit from "./pages/EventEdit";
import Bookings from "./pages/Bookings";
import Vendors from "./pages/Vendors";
import Venues from "./pages/Venues";
import MetadataEventType from './pages/MetadataEventType';
import MetadataSubType from './pages/MetadataSubType';
import MetadataFoodPref from './pages/MetadataFoodPref';
import MetadataVenueType from './pages/MetadataVenueType';
import Themes from './pages/ThemeList';
import ThemeCreate from './pages/ThemeCreate';
import ThemeView from './pages/ThemeView';
import ThemeEdit from './pages/ThemeEdit';

import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";

const queryClient = new QueryClient();

// 🔔 Request Notification Permission + Handle Foreground Messages
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      const token = await getToken(messaging, {
        vapidKey: "BPpWJf5JUC9SVOvTuNvu0C4db3_vqQz6CMy_3DV1OQzdB4s1R1mVEe9CroyQ7u48Aon_KpPsqOMT3kg69Y7s09c",
      });
      console.log("✅ FCM Token:", token);
      // Optional: Send token to your backend
    } catch (err) {
      console.error("🚫 FCM Token Error:", err);
    }
  } else {
    console.warn("🔕 Notifications not permitted");
  }
};

const App = () => {
  useEffect(() => {
    requestNotificationPermission();

    onMessage(messaging, (payload) => {
      console.log("📥 Foreground message received:", payload);
      const { title, body, image } = payload.notification || {};
      if (title && body) {
        new Notification(title, {
          body,
          icon: image || "/favicon.ico", // default fallback icon
        });
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/list" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
              <Route path="/events/view/:id" element={<ProtectedRoute><EventView /></ProtectedRoute>} />
              <Route path="/events/edit/:id" element={<ProtectedRoute><EventEdit /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
              <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/metadata/event-type" element={<ProtectedRoute><MetadataEventType /></ProtectedRoute>} />
              <Route path="/metadata/sub-type" element={<ProtectedRoute><MetadataSubType /></ProtectedRoute>} />
              <Route path="/metadata/food-pref" element={<ProtectedRoute><MetadataFoodPref /></ProtectedRoute>} />
              <Route path="/metadata/venue-type" element={<ProtectedRoute><MetadataVenueType /></ProtectedRoute>} />
              <Route path="/themes/list" element={<ProtectedRoute><Themes /></ProtectedRoute>} />
              <Route path="/themes/create" element={<ProtectedRoute><ThemeCreate /></ProtectedRoute>} />
              <Route path="/themes/edit/:id" element={<ProtectedRoute><ThemeEdit /></ProtectedRoute>} />
              <Route path="/themes/view/:id" element={<ProtectedRoute><ThemeView /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
