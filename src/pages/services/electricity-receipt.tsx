import { Zap } from "lucide-react";
import { ServiceReceiptBase } from "./receipt-base";

export default function ElectricityReceiptPage() {
  return (
    <ServiceReceiptBase
      serviceType="electricity"
      icon={<Zap className="text-success" size={40} />}
      title="Electricity Purchased"
    />
  );
}
