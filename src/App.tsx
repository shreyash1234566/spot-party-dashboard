import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/events/create" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/events/list" element={
              <ProtectedRoute>
                <EventList />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/events/view/:id" element={
              <ProtectedRoute>
                <EventView />
              </ProtectedRoute>
            } />
            <Route path="/events/edit/:id" element={
              <ProtectedRoute>
                <EventEdit />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="/vendors" element={
              <ProtectedRoute>
                <Vendors />
              </ProtectedRoute>
            } />
            <Route path="/venues" element={
              <ProtectedRoute>
                <Venues />
              </ProtectedRoute>
            } />
            <Route path="/metadata/event-type" element={
              <ProtectedRoute>
                <MetadataEventType />
              </ProtectedRoute>
            } />
            <Route path="/metadata/sub-type" element={
              <ProtectedRoute>
                <MetadataSubType />
              </ProtectedRoute>
            } />
            <Route path="/metadata/food-pref" element={
              <ProtectedRoute>
                <MetadataFoodPref />
              </ProtectedRoute>
            } />
            <Route path="/metadata/venue-type" element={
              <ProtectedRoute>
                <MetadataVenueType />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
