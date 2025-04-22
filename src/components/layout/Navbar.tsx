
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/contexts/AlertContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { alerts } = useAlerts();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const activeAlerts = alerts.filter(alert => alert.active).length;
  
  const isActive = (path: string) => location.pathname === path;
  
  const userLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alerts", path: "/alerts" },
    { name: "Become a Donor", path: "/donor-registration" },
  ];
  
  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Predictions", path: "/admin/predictions" },
    { name: "Alerts", path: "/admin/alerts" },
    { name: "Donors", path: "/admin/donors" },
  ];
  
  const navLinks = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-primary">
            Health Guardian Network
          </Link>
          
          <div className="hidden md:flex gap-6">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
                {link.name === "Alerts" && activeAlerts > 0 && (
                  <Badge className="ml-1 bg-alert-500 text-white">{activeAlerts}</Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile menu trigger */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">Menu</span>
                      {user.role === "admin" && (
                        <Badge className="ml-2 bg-primary">Admin</Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                            isActive(link.path) ? "text-primary" : "text-foreground"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.name}
                          {link.name === "Alerts" && activeAlerts > 0 && (
                            <Badge className="ml-2 bg-alert-500 text-white">{activeAlerts}</Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                    <Separator />
                    <Button variant="outline" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
