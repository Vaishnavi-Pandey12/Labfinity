import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChemistrySubject from "./pages/ChemistrySubject";
import PhysicsSubject from "./pages/PhysicsSubject";
import Experiment1 from "./pages/Experiment1";
import Experiment2 from "./pages/Experiment2";
import Experiment3 from "./pages/Experiment3";
import Experiment4 from "./pages/Experiment4";
import Experiment5 from "./pages/Experiment5";
import Experiment6 from "./pages/Experiment6";
import Experiment7 from "./pages/Experiment7";
import PhysicsExperiment1 from "./pages/PhysicsExperiment1";
import PhysicsExperiment2 from "./pages/PhysicsExperiment2";
import PhysicsExperiment3 from "./pages/PhysicsExperiment3";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/subjects/physics" element={<PhysicsSubject />} />
            <Route path="/subjects/chemistry/experiments/1" element={<Experiment1 />} />
            <Route path="/subjects/chemistry/experiments/2" element={<Experiment2 />} />
            <Route path="/subjects/chemistry/experiments/3" element={<Experiment3 />} />
            <Route path="/subjects/chemistry/experiments/4" element={<Experiment4 />} />
            <Route path="/subjects/chemistry/experiments/5" element={<Experiment5 />} />
            <Route path="/subjects/chemistry/experiments/6" element={<Experiment6 />} />
            <Route path="/subjects/chemistry/experiments/7" element={<Experiment7 />} />
            <Route path="/subjects/physics/experiments/1" element={<PhysicsExperiment1 />} />
            <Route path="/subjects/physics/experiments/2" element={<PhysicsExperiment2 />} />
             <Route path="/subjects/physics/experiments/3" element={<PhysicsExperiment3 />} />
            <Route path="/experiments" element={<Navigate to="/home" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
