"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/lib/auth";

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated && requireAuth) {
      router.push("/login");
    } else {
      setUser(currentUser);
    }

    setLoading(false);
  }, [requireAuth, router]);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    isSuperAdmin: authService.isSuperAdmin(),
  };
}
