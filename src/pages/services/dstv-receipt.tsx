import { Tv } from "lucide-react";
import { ServiceReceiptBase } from "./receipt-base";

export default function DstvReceiptPage() {
  return (
    <ServiceReceiptBase
      serviceType="dstv"
      icon={<Tv className="text-success" size={40} />}
      title="DStv Subscription Activated"
    />
  );
}
