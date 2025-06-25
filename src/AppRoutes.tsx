import { Routes, Route } from 'react-router-dom';
import EventList from './pages/EventList';
import EventView from './pages/EventView';
import EventEdit from './pages/EventEdit';
import CreateEvent from './pages/CreateEvent';

const AppRoutes = () => (
  <Routes>
    <Route path="/events" element={<EventList />} />
    <Route path="/events/create" element={<CreateEvent />} />
    <Route path="/events/view/:id" element={<EventView />} />
    <Route path="/events/edit/:id" element={<EventEdit />} />
    {/* Add other routes as needed */}
  </Routes>
);

export default AppRoutes;
