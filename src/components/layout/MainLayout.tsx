
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

type MainLayoutProps = {
  children: React.ReactNode;
  title: string;
};

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-[70px]" : "lg:pl-[250px]"
      )}>
        <Header title={title} />
        <main className="animate-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
