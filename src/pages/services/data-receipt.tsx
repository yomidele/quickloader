import { Smartphone } from "lucide-react";
import { ServiceReceiptBase } from "./receipt-base";

export default function DataReceiptPage() {
  return (
    <ServiceReceiptBase
      serviceType="data"
      icon={<Smartphone className="text-success" size={40} />}
      title="Data Purchased"
    />
  );
}
