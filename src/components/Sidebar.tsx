import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Plus, 
  List, 
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft, // Import ChevronLeft for the main toggle
  BookOpen, 
  Building2, 
  Store,
  Palette,
  Bell,
  Settings,   // Import a more suitable icon for Metadata
  FileText,   // Import a more suitable icon for Description
  HelpCircle, // Import a more suitable icon for FAQ
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GiCarousel } from "react-icons/gi";

// --- Improved Data Structure ---
// All menu items are now in a single, easy-to-manage array.
// Corrected typo and used more appropriate icons.
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Users', path: '/users' },
  {
    icon: Calendar,
    label: 'Events',
    path: '/events',
    submenu: [
      { icon: Plus, label: 'Create', path: '/events/create' },
      { icon: List, label: 'List', path: '/events/list' },
    ],
  },
  {
    icon: Palette,
    label: 'Themes',
    path: '/themes',
    submenu: [
      { icon: Plus, label: 'Create', path: '/themes/create' },
      { icon: List, label: 'List', path: '/themes/list' },
    ],
  },
  { 
    icon: CreditCard, 
    label: 'Subscription', 
    path: '/subscription',
    submenu: [
      { icon: Plus, label: 'Create', path: '/subscription/create' },
      { icon: List, label: 'List', path: '/subscription/list' },
    ],
  },
  { icon: BookOpen, label: 'Bookings', path: '/bookings' },
  { icon: Store, label: 'Vendors', path: '/vendors' },
  { icon: Building2, label: 'Venues', path: '/venues' },
  {
    icon: Bell,
    label: 'Notifications',
    path: '/notifications',
    submenu: [
      { icon: Plus, label: 'Create', path: '/notifications/create' },
      { icon: List, label: 'List', path: '/notifications/list' },
    ],
  },
  {
    icon: FileText, // Corrected Icon
    label: 'Description', // Corrected Typo
    path: '/description', // Corrected path
    submenu: [
      { icon: Plus, label: 'Create', path: '/description/create' },
      { icon: List, label: 'List', path: '/description/list' },
    ],
  },
  {
    icon: HelpCircle, // Corrected Icon
    label: 'FAQ',
    path: '/faq',
    submenu: [
      { icon: Plus, label: 'Create', path: '/faq/create' },
      { icon: List, label: 'List', path: '/faq/list' },
    ],
  },
  {
    icon: GiCarousel, // Corrected Icon
    label: 'Carousel',
    path: '/carousel',
    submenu: [
      { icon: Plus, label: 'Create', path: '/carousel/create' },
      { icon: List, label: 'List', path: '/carousel/list' },
    ],
  },
  // --- Metadata section is now part of the main array ---
  {
    icon: Settings,
    label: 'Metadata',
    path: '/metadata',
    submenu: [
      { icon: Plus, label: 'Event Type', path: '/metadata/event-type' },
      { icon: Plus, label: 'Sub-Type', path: '/metadata/sub-type' },
      { icon: Plus, label: 'Food Preference', path: '/metadata/food-pref' },
      { icon: Plus, label: 'Venue Type', path: '/metadata/venue-type' },
    ],
  },
];


const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  // --- Smarter State Initialization ---
  // The sidebar now automatically opens the menu containing the active page on load.
  const findActiveMenu = () => {
    const activeParent = menuItems.find(item => 
      item.submenu && location.pathname.startsWith(item.path)
    );
    return activeParent ? activeParent.label : null;
  };
  
  const [expandedMenu, setExpandedMenu] = useState<string | null>(findActiveMenu());

  const handleMenuToggle = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  // --- Simplified Active State Logic ---
  const isParentActive = (item: typeof menuItems[0]) => {
    if (!item.submenu) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const isSubmenuActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col flex-shrink-0`}>
      <div className="flex items-center p-4 border-b border-gray-200" style={{ height: '65px' }}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 flex-grow">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">EventAdmin</span>
            </div>
          )}
           {isCollapsed && (
            <div className="flex items-center justify-center flex-grow">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
            </div>
          )}

          {/* --- Improved Toggle Button --- */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-800 flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
      </div>

      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-1">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => handleMenuToggle(item.label)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium text-left rounded-lg transition-colors duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isParentActive(item)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {/* --- More Intuitive Chevron Icons --- */}
                      {expandedMenu === item.label ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
                {!isCollapsed && expandedMenu === item.label && (
                  <div className="ml-4 pl-4 border-l border-gray-200 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 w-full ${
                          isSubmenuActive(subItem.path)
                            ? 'bg-indigo-100 text-indigo-800 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                  isParentActive(item)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
          </div>
        )}
        <Button
          onClick={logout}
          variant="ghost"
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <LogOut className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-2'}`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;