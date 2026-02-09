import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "@/context/ChatContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { createRoot } from "react-dom/client";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <BrowserRouter>
                <ChatProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/c/:id" element={<Index />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </ChatProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
