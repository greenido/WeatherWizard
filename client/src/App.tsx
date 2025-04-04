import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { TemperatureUnitProvider } from "@/contexts/TemperatureUnitContext";
import Footer from "@/components/Footer";
import InstallPWA from "@/components/InstallPWA";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TemperatureUnitProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground dark:bg-slate-900 dark:text-slate-50">
        <div className="flex-grow">
          <Router />
        </div>
        <Footer />
        <InstallPWA />
        <Toaster />
      </div>
    </TemperatureUnitProvider>
  );
}

export default App;
