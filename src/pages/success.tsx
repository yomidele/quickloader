import { Navigate, useSearchParams } from "react-router-dom";

// Legacy route — receipts must come from server-verified Paystack data.
// Forward to /payment-pending which performs verification before
// rendering the receipt from the verified transaction's metadata.
export default function Success() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  
  return (
    <Navigate 
      to={`/payment-pending${reference ? `?reference=${reference}` : ""}`}
      replace 
    />
  );
}
