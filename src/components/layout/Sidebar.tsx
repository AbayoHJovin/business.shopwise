
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  ClipboardList, 
  BarChart, 
  Calendar, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed?: boolean;
};

const NavItem = ({ icon: Icon, label, href, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <a 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-white/10 transition-colors",
        isActive && "bg-white/10 text-sidebar-foreground font-medium"
      )}
    >
      <Icon className="w-5 h-5" />
      {!isCollapsed && <span>{label}</span>}
    </a>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Load collapsed state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar flex flex-col transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[250px]",
          !isMobileOpen && "max-lg:-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {!isCollapsed && (
            <h1 className="font-bold text-lg text-sidebar-foreground">ShopWise</h1>
          )}
          <Button 
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground hover:bg-white/10 flex"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <NavItem icon={Home} label="Dashboard" href="/dashboard" isCollapsed={isCollapsed} />
          <NavItem icon={Package} label="Products" href="/products" isCollapsed={isCollapsed} />
          <NavItem icon={Users} label="Employees" href="/employees" isCollapsed={isCollapsed} />
          <NavItem icon={ClipboardList} label="Expenses" href="/expenses" isCollapsed={isCollapsed} />
          <NavItem icon={BarChart} label="Sales" href="/sales" isCollapsed={isCollapsed} />
          <NavItem icon={FileText} label="Daily Logs" href="/daily-logs" isCollapsed={isCollapsed} />
          <NavItem icon={MessageSquare} label="AI Chat" href="/ai-chat" isCollapsed={isCollapsed} />
          <NavItem icon={Settings} label="Settings" href="/settings" isCollapsed={isCollapsed} />
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                JS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground">Abayo Jovin</span>
                <span className="text-xs text-sidebar-foreground/70">Admin</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
