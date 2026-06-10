import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Import route components
// These will be refactored from the old TanStack file routes in Phase 2

export default function App() {
  return (
    <>
      <Routes>
        {/* Routes will be added in Phase 2 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
