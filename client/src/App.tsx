import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DeviceManagement from "./pages/DeviceManagement";
import ConversationMonitor from "./pages/ConversationMonitor";
import NetworkIntelligence from "./pages/NetworkIntelligence";
import Rewards from "./pages/Rewards";
import Analytics from "./pages/Analytics";
import LoRaDevices from "./pages/LoRaDevices";
import HybridNetwork from "./pages/HybridNetwork";
import Telecommunications from "./pages/Telecommunications";
import CoverageOpportunities from "./pages/CoverageOpportunities";
import CryptoPayments from "./pages/CryptoPayments";
import { NetworkStatusIndicator } from "./components/NetworkStatusIndicator";
import { IOSConnectionBanner } from "./components/IOSConnectionBanner";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/device-management"} component={DeviceManagement} />
      <Route path={"/conversation-monitor"} component={ConversationMonitor} />
      <Route path={"/network-intelligence"} component={NetworkIntelligence} />
      <Route path={"/rewards"} component={Rewards} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/lora-devices"} component={LoRaDevices} />
      <Route path={"/hybrid-network"} component={HybridNetwork} />
      <Route path={"/telecommunications"} component={Telecommunications} />
      <Route path={"/coverage-opportunities"} component={CoverageOpportunities} />
      <Route path={"/crypto-payments"} component={CryptoPayments} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // Apple iOS 26 Monaco Edition - Dark theme with liquid glass
      >
        <TooltipProvider>
          <Toaster />
          <IOSConnectionBanner />
          <NetworkStatusIndicator />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
