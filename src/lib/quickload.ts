export const networks = [
  { id: "mtn", name: "MTN", color: "#FFCC00", text: "#111" },
  { id: "airtel", name: "Airtel", color: "#E40000", text: "#fff" },
  { id: "glo", name: "Glo", color: "#00B140", text: "#fff" },
  { id: "9mobile", name: "9mobile", color: "#006F3C", text: "#fff" },
];

export const dataPlans = [
  { id: 1, size: "500MB", validity: "30 Days", price: 180 },
  { id: 2, size: "1GB", validity: "30 Days", price: 300 },
  { id: 3, size: "2GB", validity: "30 Days", price: 580 },
  { id: 4, size: "3GB", validity: "30 Days", price: 850 },
  { id: 5, size: "5GB", validity: "30 Days", price: 1450 },
  { id: 6, size: "10GB", validity: "30 Days", price: 2900 },
  { id: 7, size: "15GB", validity: "30 Days", price: 4200 },
  { id: 8, size: "40GB", validity: "30 Days", price: 9800 },
];

export const tvProviders = [
  { id: "dstv", name: "DStv", tag: "Premium" },
  { id: "gotv", name: "GOtv", tag: "Popular" },
  { id: "startimes", name: "Startimes", tag: "Affordable" },
];

export const tvPackages = [
  { id: "compact", name: "DStv Compact", price: 15700 },
  { id: "compact-plus", name: "DStv Compact Plus", price: 25000 },
  { id: "premium", name: "DStv Premium", price: 37000 },
  { id: "yanga", name: "GOtv Yanga", price: 3600 },
  { id: "jolli", name: "GOtv Jolli", price: 5800 },
];

export const discos = [
  { id: "ekedc", name: "EKEDC", short: "Eko Electric" },
  { id: "ikedc", name: "IKEDC", short: "Ikeja Electric" },
  { id: "aedc", name: "AEDC", short: "Abuja Electric" },
  { id: "phedc", name: "PHEDC", short: "Port Harcourt" },
  { id: "ibedc", name: "IBEDC", short: "Ibadan Electric" },
  { id: "kedco", name: "KEDCO", short: "Kano Electric" },
];

export const transactions = [
  { id: "TX9821", type: "airtime", title: "MTN Airtime · 0803•••1234", amount: -500, status: "success", date: "Today, 10:24 AM", color: "#FFCC00" },
  { id: "TX9820", type: "data", title: "Airtel 2GB Data", amount: -580, status: "success", date: "Today, 09:11 AM", color: "#E40000" },
  { id: "TX9819", type: "wallet", title: "Wallet Funding · Transfer", amount: 10000, status: "success", date: "Yesterday, 8:45 PM", color: "#16A34A" },
  { id: "TX9818", type: "tv", title: "DStv Compact Renewal", amount: -15700, status: "pending", date: "Yesterday, 6:02 PM", color: "#0057A6" },
  { id: "TX9817", type: "electricity", title: "EKEDC Prepaid · 4521•••", amount: -3500, status: "failed", date: "Jun 2, 4:30 PM", color: "#F97316" },
  { id: "TX9816", type: "airtime", title: "Glo Airtime · 0805•••7711", amount: -200, status: "success", date: "Jun 1, 11:10 AM", color: "#00B140" },
];

export function formatNaira(n: number) {
  const abs = Math.abs(n).toLocaleString("en-NG", { minimumFractionDigits: 2 });
  return `${n < 0 ? "-" : ""}₦${abs}`;
}
