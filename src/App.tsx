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
// 1. Import the new ThemeView component
import ThemeView from './pages/ThemeView'; 
import ThemeEdit from './pages/ThemeEdit';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ... other public routes like Index and Login ... */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* --- Protected Routes --- */}
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
            
            {/* Metadata Routes */}
            <Route path="/metadata/event-type" element={<ProtectedRoute><MetadataEventType /></ProtectedRoute>} />
            <Route path="/metadata/sub-type" element={<ProtectedRoute><MetadataSubType /></ProtectedRoute>} />
            <Route path="/metadata/food-pref" element={<ProtectedRoute><MetadataFoodPref /></ProtectedRoute>} />
            <Route path="/metadata/venue-type" element={<ProtectedRoute><MetadataVenueType /></ProtectedRoute>} />

            {/* Theme Routes */}
            <Route path="/themes/list" element={<ProtectedRoute><Themes /></ProtectedRoute>} />
            <Route path="/themes/create" element={<ProtectedRoute><ThemeCreate /></ProtectedRoute>} />
            <Route path="/themes/edit/:id" element={<ProtectedRoute><ThemeEdit /></ProtectedRoute>} />
           
            <Route path="/themes/view/:id" element={<ProtectedRoute><ThemeView /></ProtectedRoute>} />
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;