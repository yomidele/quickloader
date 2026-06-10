import { Navigate, useSearchParams } from "react-router-dom";

// Legacy route — failure state must reflect server-verified Paystack data.
export default function Failed() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  
  return (
    <Navigate 
      to={reference ? `/payment-pending?reference=${reference}` : "/wallet"}
      replace 
    />
  );
}
