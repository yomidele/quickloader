import { Phone } from "lucide-react";
import { ServiceReceiptBase } from "./receipt-base";

export default function AirtimeReceiptPage() {
  return (
    <ServiceReceiptBase
      serviceType="airtime"
      icon={<Phone className="text-success" size={40} />}
      title="Airtime Purchased"
    />
  );
}
