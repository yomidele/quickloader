import { useAuthUser } from "@/lib/auth";

export function useAuth() {
  const { user, loading } = useAuthUser();
  
  // Check if user is admin (you can customize this based on your user data structure)
  const isAdmin = user && (user as any)?.user_metadata?.role === 'admin';
  
  return {
    user,
    loading,
    isAdmin: !!isAdmin,
  };
}
