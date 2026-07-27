import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/lib/auth";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function WalletVerifyPage() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      toast.error("Invalid payment reference");
      navigate("/wallet");
      return;
    }

    async function verify() {
      try {
        const token = await getIdToken();
        const response = await fetch(`${API_URL}/api/wallet/verify?reference=${reference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Verification failed");
        }

        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem("last_funding_amount", String(data.amount));
          navigate(`/wallet/success?amount=${data.amount}`);
        } else {
          navigate(`/wallet/failed?error=${encodeURIComponent(data.error || 'Payment verification failed')}`);
        }
      } catch (error) {
        toast.error((error as Error).message || "Verification error");
        navigate("/wallet/failed?error=Verification error");
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
        <p className="text-sm text-muted-foreground">Verifying your payment...</p>
      </div>
    </div>
  );
}
