
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Calendar, Plus, List, CreditCard, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
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
      { icon: List, label: 'List', path: '/events/list' }
    ]
  },
  { icon: CreditCard, label: 'Subscription', path: '/subscription' }
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
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen shadow-lg`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
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
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="mt-6 px-3">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-2">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => handleMenuToggle(item.label)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                    isActive(item.path) 
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <div className={`transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-90' : ''}`}>
                        ▶
                      </div>
                    </>
                  )}
                </button>
                {!isCollapsed && expandedMenu === item.label && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          location.pathname === subItem.path
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      >
                        <subItem.icon className="w-4 h-4 mr-2" />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        )}
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
