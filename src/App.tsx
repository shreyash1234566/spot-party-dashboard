import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Page Imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/EventCreate";
import EventList from "./pages/EventList";
import Users from "./pages/Users";
import SubscriptionCreate from "./pages/SubscriptionCreate.tsx";
import SubscriptionList from "./pages/SubscriptionList.tsx";
import SubscriptionView from "./pages/SubscriptionView.tsx";
import SubscriptionEdit from "./pages/SubscriptionEdit.tsx";
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
import FaqCreate from "./pages/FaqCreate.tsx";
import FaqList from "./pages/FaqList.tsx";
import FaqView from "./pages/FaqView.tsx";
import FaqEdit from "./pages/FaqEdit.tsx";
import DescriptionCreate from "./pages/DescriptionCreate.tsx";
import DescriptionList from "./pages/DescriptionList.tsx";
import DescriptionView from "./pages/DesciptionView.tsx"; // Fixed typo: DesceiptionView -> DescriptionView
import DescriptionEdit from "./pages/DescriptionEdit.tsx";
import CarouselCreate from "./pages/CarouselCreate.tsx";
import CarouselList from "./pages/CarouselList.tsx";   // Added for Carousel CRUD

  // Added for Carousel CRUD

import { messaging } from "./firebase-config";
import { getToken, onMessage } from "firebase/messaging";
import NotificationModule from "./pages/NotificationCreate.tsx";
import PastNotificationsList from "./pages/NotificationView.tsx";

const queryClient = new QueryClient();

// 🔔 Request Notification Permission + Handle Foreground Messages
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      const token = await getToken(messaging, {
        vapidKey: "BLqUMasple8GWDVCky6u5b1VaN_ewxd2JXyNcccgQhBcyw0cdcL2xGJcJhmNZKu7jBLYj4VTQzMbbNL9JtZ2gUo",
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
              {/* General & Auth */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />

              {/* Events */}
              <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/list" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
              <Route path="/events/view/:id" element={<ProtectedRoute><EventView /></ProtectedRoute>} />
              <Route path="/events/edit/:id" element={<ProtectedRoute><EventEdit /></ProtectedRoute>} />
              
              {/* Other Main Features */}
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
              <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />

              {/* Subscriptions */}
              <Route path="/subscription/create" element={<ProtectedRoute><SubscriptionCreate /></ProtectedRoute>} />
              <Route path="/subscription/list" element={<ProtectedRoute><SubscriptionList /></ProtectedRoute>} />
              <Route path="/subscription/edit/:id" element={<ProtectedRoute><SubscriptionEdit /></ProtectedRoute>} />
              <Route path="/subscription/view/:id" element={<ProtectedRoute><SubscriptionView /></ProtectedRoute>} />

              {/* Metadata */}
              <Route path="/metadata/event-type" element={<ProtectedRoute><MetadataEventType /></ProtectedRoute>} />
              <Route path="/metadata/sub-type" element={<ProtectedRoute><MetadataSubType /></ProtectedRoute>} />
              <Route path="/metadata/food-pref" element={<ProtectedRoute><MetadataFoodPref /></ProtectedRoute>} />
              <Route path="/metadata/venue-type" element={<ProtectedRoute><MetadataVenueType /></ProtectedRoute>} />

              {/* Themes */}
              <Route path="/themes/list" element={<ProtectedRoute><Themes /></ProtectedRoute>} />
              <Route path="/themes/create" element={<ProtectedRoute><ThemeCreate /></ProtectedRoute>} />
              <Route path="/themes/edit/:id" element={<ProtectedRoute><ThemeEdit /></ProtectedRoute>} />
              <Route path="/themes/view/:id" element={<ProtectedRoute><ThemeView /></ProtectedRoute>} />
              
              {/* FAQs */}
              <Route path="/faq/create" element={<ProtectedRoute><FaqCreate /></ProtectedRoute>} />
              <Route path="/faq/list" element={<ProtectedRoute><FaqList /></ProtectedRoute>} />
              <Route path="/faq/edit/:id" element={<ProtectedRoute><FaqEdit /></ProtectedRoute>} />
              <Route path="/faq/view/:id" element={<ProtectedRoute><FaqView /></ProtectedRoute>} />

              {/* Descriptions */}
              <Route path="/description/create" element={<ProtectedRoute><DescriptionCreate /></ProtectedRoute>} />
              <Route path="/description/list" element={<ProtectedRoute><DescriptionList /></ProtectedRoute>} />
              <Route path="/description/edit/:id" element={<ProtectedRoute><DescriptionEdit /></ProtectedRoute>} />
              <Route path="/description/view/:id" element={<ProtectedRoute><DescriptionView /></ProtectedRoute>} />
              
              {/* Carousel */}
              <Route path="/carousel/create" element={<ProtectedRoute><CarouselCreate /></ProtectedRoute>} />
              <Route path="/carousel/list" element={<ProtectedRoute><CarouselList /></ProtectedRoute>} />
              

              {/* Notifications */}
              <Route path="/notifications/create" element={<ProtectedRoute><NotificationModule /></ProtectedRoute>} />
              <Route path="/notifications/list" element={<ProtectedRoute><PastNotificationsList /></ProtectedRoute>} />

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;