import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { Upload, User, LogOut, Menu, Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Video className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-bold text-foreground">VideoShare</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link to="/upload">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {profileLoading ? (
                      <Menu className="h-5 w-5" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                        {userProfile?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {userProfile?.username || "User"}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/my-videos" className="cursor-pointer">
                      <Video className="mr-2 h-4 w-4" />
                      My Videos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Subscriptions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAuth} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!isAuthenticated && (
            <Button onClick={handleAuth} disabled={isLoggingIn} size="sm">
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
