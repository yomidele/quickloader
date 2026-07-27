import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/quickload";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ReceiptData {
  serviceType: 'airtime' | 'data' | 'dstv' | 'electricity';
  amount: number;
  metadata: Record<string, any>;
  transaction: any;
}

export default function ServiceVerifyPage({ serviceType }: { serviceType: 'airtime' | 'data' | 'dstv' | 'electricity' }) {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      toast.error("Invalid payment reference");
      navigate(`/purchase/${serviceType}`);
      return;
    }

    async function verify() {
      try {
        const token = await getIdToken();
        const response = await fetch(`${API_URL}/api/services/${serviceType}/verify?reference=${reference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Verification failed");
        }

        const data = await response.json();
        
        if (data.success) {
          setReceiptData(data);
          // Auto-redirect to receipt page after 2 seconds
          setTimeout(() => {
            navigate(`/services/${serviceType}/receipt?reference=${reference}`, {
              state: { receiptData: data },
            });
          }, 2000);
        } else {
          navigate(`/services/${serviceType}/failed?error=${encodeURIComponent(data.error || 'Payment verification failed')}`);
        }
      } catch (error) {
        toast.error((error as Error).message || "Verification error");
        navigate(`/services/${serviceType}/failed?error=Verification error`);
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [searchParams, user, navigate, serviceType]);

  if (!verifying && receiptData) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="animate-spin text-success" size={32} />
          </div>
          <p className="text-sm text-muted-foreground">Payment verified!</p>
          <p className="text-xs text-muted-foreground mt-2">Preparing receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
        <p className="text-sm text-muted-foreground">Verifying your payment...</p>
      </div>
    </div>
  );
}
