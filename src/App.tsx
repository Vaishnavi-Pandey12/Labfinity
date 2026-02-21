import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChemistrySubject from "./pages/ChemistrySubject";
import Experiment1 from "./pages/Experiment1";
import Experiment2 from "./pages/Experiment2";
import Experiment3 from "./pages/Experiment3";
import Experiment4 from "./pages/Experiment4";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subjects" element={<Navigate to="/home" replace />} />
          <Route path="/subjects/chemistry" element={<ChemistrySubject />} />
          <Route path="/subjects/chemistry/experiments/1" element={<Experiment1 />} />
          <Route path="/subjects/chemistry/experiments/2" element={<Experiment2 />} />
          <Route path="/subjects/chemistry/experiments/3" element={<Experiment3 />} />
          <Route path="/subjects/chemistry/experiments/4" element={<Experiment4 />} />
          <Route path="/experiments" element={<Navigate to="/home" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
