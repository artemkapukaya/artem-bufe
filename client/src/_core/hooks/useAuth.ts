import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

type UseAuthOptions = {
    redirectOnUnauthenticated?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
    const utils = trpc.useUtils();

    const meQuery = trpc.auth.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Admin oturumu sessionStorage token ile kontrol edilir.
    // Token yoksa veya süresi dolmuşsa admin erişimi kapalıdır.
    const adminToken = typeof window !== "undefined"
        ? sessionStorage.getItem("adminToken")
        : null;
    const adminTokenExp = typeof window !== "undefined"
        ? Number(sessionStorage.getItem("adminTokenExp") ?? "0")
        : 0;
    const adminSessionValid = !!adminToken && Date.now() < adminTokenExp;

    const state = useMemo(() => {
        // Gerçek kullanıcı varsa onu kullan
        if (meQuery.data) {
            return {
                user: meQuery.data,
                loading: false,
                isAuthenticated: true,
            };
        }

        // Admin token geçerliyse admin user döndür
        if (adminSessionValid) {
            const storedUsername = localStorage.getItem("adminUsername") ?? "admin";
            return {
                user: { id: "admin", name: storedUsername, role: "admin" as const },
                loading: false,
                isAuthenticated: true,
            };
        }

        // Yükleniyor mu?
        if (meQuery.isLoading) {
            return { user: null, loading: true, isAuthenticated: false };
        }

        // Giriş yapılmamış
        return { user: null, loading: false, isAuthenticated: false };
    }, [meQuery.data, meQuery.isLoading, adminSessionValid]);

    const logout = () => {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminTokenExp");
        utils.auth.me.reset();
    };

    return { ...state, logout };
}
