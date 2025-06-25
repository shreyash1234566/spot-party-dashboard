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
  BookOpen, 
  Building2, 
  Store 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
  { icon: CreditCard, label: 'Subscription', path: '/subscription' },
  { icon: BookOpen, label: 'Bookings', path: '/bookings' },
  { icon: Store, label: 'Vendors', path: '/vendors' },
  { icon: Building2, label: 'Venues', path: '/venues' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Events');
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleMenuToggle = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (path: string) => {
    if (location.pathname.startsWith(path) && path !== '/dashboard' && path !== '/users' && path !== '/subscription') {
      return true;
    }
    return location.pathname === path;
  };

  const isSubmenuActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col flex-shrink-0`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 flex-grow">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">EventAdmin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="mt-4 px-3 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-1">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => handleMenuToggle(item.label)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium text-left rounded-lg transition-colors duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {!isCollapsed && expandedMenu === item.label && (
                  <div className="ml-4 pl-4 border-l border-gray-200 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
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
                  isActive(item.path)
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
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
