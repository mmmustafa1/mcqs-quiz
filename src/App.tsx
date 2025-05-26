
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { HistoryProvider } from "./contexts/HistoryContext"; // Import HistoryProvider
import { AuthProvider } from "./contexts/AuthContext"; // Import AuthProvider
import { FlashcardProvider } from "./contexts/FlashcardContext"; // Import FlashcardProvider
import { FlashcardHistoryProvider } from "./contexts/FlashcardHistoryContext"; // Import FlashcardHistoryProvider
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Theme persistence setup
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />        <AuthProvider> {/* Wrap with AuthProvider */}
          <HistoryProvider> {/* Wrap BrowserRouter with HistoryProvider */}
            <FlashcardProvider> {/* Wrap with FlashcardProvider */}
              <FlashcardHistoryProvider> {/* Wrap with FlashcardHistoryProvider */}
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </FlashcardHistoryProvider> {/* Close FlashcardHistoryProvider */}
            </FlashcardProvider> {/* Close FlashcardProvider */}
          </HistoryProvider> {/* Close HistoryProvider */}
        </AuthProvider> {/* Close AuthProvider */}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
