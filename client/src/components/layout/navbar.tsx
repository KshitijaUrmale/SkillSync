import { FC, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Bell, Menu, RefreshCw } from "lucide-react";

const Navbar: FC = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SkillSync</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link 
                href="/explore"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/explore" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Explore Skills
              </Link>
              {user && (
                <>
                  <Link 
                    href="/messages"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location === "/messages" 
                        ? "border-primary text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    My Exchanges
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="ml-3">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                      Your Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")}>
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-6">
                  <Link 
                    href="/"
                    className={`text-base font-medium ${
                      location === "/" ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/explore"
                    className={`text-base font-medium ${
                      location === "/explore" ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    Explore Skills
                  </Link>
                  {user ? (
                    <>
                      <Link 
                        href="/messages"
                        className={`text-base font-medium ${
                          location === "/messages" ? "text-primary" : "text-gray-500"
                        }`}
                      >
                        My Exchanges
                      </Link>
                      <Link 
                        href={`/profile/${user.id}`}
                        className={`text-base font-medium ${
                          location.startsWith("/profile") ? "text-primary" : "text-gray-500"
                        }`}
                      >
                        Your Profile
                      </Link>
                      <Button variant="ghost" className="justify-start p-0" onClick={handleLogout}>
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => navigate("/login")}>
                        Log in
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/register")}>
                        Sign up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
