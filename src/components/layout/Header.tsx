import React, { useState } from "react";
import { Bell, Search, User, LogOut, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  const { user: authContextUser } = useAuth(); // Rename to avoid conflict with Redux user
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: reduxUser, isLoading } = useAppSelector((state) => state.auth);

  // Use Redux user if available, otherwise fall back to context user
  const user = reduxUser || authContextUser;

  // State for logout confirmation dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Helper function to get user's name regardless of user object structure
  const getUserName = () => {
    if (!user) return "";
    // Handle both Redux user (name) and AuthContext user (fullName)
    return "name" in user ? user.name : user.fullName;
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return "U";

    // Get name from user object using the helper function
    const displayName = getUserName();

    const nameParts = displayName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0]?.[0]?.toUpperCase() || "U";
  };

  // Handle logout with confirmation
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  // Handle confirmed logout
  const handleConfirmLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setLogoutDialogOpen(false);
    }
  };
  return (
    <>
      <header className="border-b bg-background sticky top-0 z-30 flex h-16 items-center">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8 bg-background"
              />
            </div>

            <Link to="/businesses">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2"
              >
                <Store className="h-4 w-4" />
                <span>Discover Businesses</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>New product added</DropdownMenuItem>
                <DropdownMenuItem>Employee request pending</DropdownMenuItem>
                <DropdownMenuItem>Monthly report ready</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                    {getUserInitials()}
                  </div>
                  <span>{getUserName().split(" ")[0] || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getUserName() || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/settings/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogoutClick}
                  className="text-destructive focus:text-destructive"
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoading ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to log in again to access your account."
        confirmText="Log out"
        confirmVariant="destructive"
        isLoading={isLoading}
      />
    </>
  );
};

export default Header;
