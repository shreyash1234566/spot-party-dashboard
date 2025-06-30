import { Routes, Route } from 'react-router-dom';
import EventList from './pages/EventList';
import EventView from './pages/EventView';
import EventEdit from './pages/EventEdit';
import CreateEvent from './pages/CreateEvent';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import Vendors from './pages/Vendors';
import Venues from './pages/Venues';
import NotFound from './pages/NotFound';

const AppRoutes = () => (
  <Routes>
    <Route path="/events" element={<EventList />} />
    <Route path="/events/create" element={<CreateEvent />} />
    <Route path="/events/view/:id" element={<EventView />} />
    <Route path="/events/edit/:id" element={<EventEdit />} />
    <Route path="/users" element={<Users />} />
    <Route path="/bookings" element={<Bookings />} />
    <Route path="/vendors" element={<Vendors />} />
    <Route path="/venues" element={<Venues />} />
    <Route path="*" element={<NotFound />} />
    {/* Add other routes as needed */}
  </Routes>
);

export default AppRoutes;
