import { StrictMode } from "react";
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { Navbar } from "./components/Navbar";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { HomePage } from "./pages/HomePage";
import { VideoPlayerPage } from "./pages/VideoPlayerPage";
import { UploadPage } from "./pages/UploadPage";
import { ChannelPage } from "./pages/ChannelPage";
import { MyVideosPage } from "./pages/MyVideosPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

// Root layout component with profile setup check
function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with love using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <ProfileSetupModal open={showProfileSetup} />
      <Toaster />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video/$videoId",
  component: VideoPlayerPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channel/$userId",
  component: ChannelPage,
});

const myVideosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-videos",
  component: MyVideosPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: SubscriptionsPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  videoRoute,
  uploadRoute,
  channelRoute,
  myVideosRoute,
  subscriptionsRoute,
]);

// Create router
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>
  );
}
