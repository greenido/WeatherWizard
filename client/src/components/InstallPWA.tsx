import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWA() {
  // Check if this is the user's first visit
  const [showBanner, setShowBanner] = useState(() => {
    // Check if user has visited before
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore') === 'true';
    const wasBannerDismissed = localStorage.getItem('pwaInstallBannerDismissed') === 'true';
    
    // console.log("PWA Debug - First visit check:");
    // console.log("  - Has visited before:", hasVisitedBefore);
    // console.log("  - Banner was dismissed:", wasBannerDismissed);
    
    // Record that the user has now visited the site
    localStorage.setItem('hasVisitedBefore', 'true');
    
    // Only show banner on first visit and if it hasn't been dismissed
    const shouldShowBanner = !hasVisitedBefore && !wasBannerDismissed;
    console.log("  - Should show banner:", shouldShowBanner);
    
    return shouldShowBanner;
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // If banner was dismissed, don't set up any PWA prompt functionality
    if (!showBanner) {
      console.log("PWA Debug - Banner was previously dismissed, not showing");
      return;
    }
    
    // Log debug information
    console.log("PWA Debug - User Agent:", navigator.userAgent);
    console.log("PWA Debug - Is Standalone:", window.matchMedia('(display-mode: standalone)').matches);
    
    // Detect if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("PWA Debug - Is Mobile:", isMobile);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // If the banner was dismissed in another tab or during this session
      if (localStorage.getItem('pwaInstallBannerDismissed') === 'true') {
        console.log("PWA Debug - Banner was dismissed, not showing prompt");
        setShowBanner(false);
        return;
      }
      
      // Log when the event is fired
      console.log("PWA Debug - beforeinstallprompt event fired");
      
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Only attach the event listener if the app is not installed
    if (!isAppInstalled) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      console.log("PWA Debug - Added beforeinstallprompt listener");
    }
    
    // Also check for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pwaInstallBannerDismissed' && e.newValue === 'true') {
        setShowBanner(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [showBanner]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("PWA Debug - No deferred prompt available");
      return;
    }
    
    // Show the install prompt
    console.log("PWA Debug - Showing install prompt");
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    console.log("PWA Debug - User dismissed the banner");
    localStorage.setItem('pwaInstallBannerDismissed', 'true');
    setShowBanner(false);
  };

  // Don't render anything if the banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  // Always show the same banner UI, no conditional branches
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white p-3 flex items-center justify-between z-50">
      <div className="flex-1">
        <p className="font-medium">Install Forecast Fusion on your device</p>
        <p className="text-sm text-blue-100">Get quick access to weather forecasts</p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleInstallClick} 
          variant="secondary" 
          className="whitespace-nowrap"
        >
          Install App
        </Button>
        <Button
          onClick={dismissBanner}
          variant="ghost"
          className="p-1 h-auto text-white hover:text-white"
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
}