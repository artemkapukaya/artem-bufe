export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
    // .env dosyasýndan gelen deðerler (Yoksa boþ string döner, undefined kalmaz)
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "";
    const appId = import.meta.env.VITE_APP_ID || "missing-app-id";

    const redirectUri = typeof window !== "undefined"
        ? `${window.location.origin}/api/oauth/callback`
        : "";
    const state = btoa(redirectUri);

    try {
        // Eðer oauthPortalUrl boþsa veya geçersizse new URL hata fýrlatýr, onu yakalýyoruz
        const base = oauthPortalUrl.startsWith('http') ? oauthPortalUrl : `https://${oauthPortalUrl}`;
        const url = new URL(`${base}/app-auth`);

        url.searchParams.set("appId", appId);
        url.searchParams.set("redirectUri", redirectUri);
        url.searchParams.set("state", state);
        url.searchParams.set("type", "signIn");

        return url.toString();
    } catch (error) {
        // Hata durumunda uygulama çökmez, konsola uyarý basar
        console.warn("Login URL oluþturulamadý: VITE_OAUTH_PORTAL_URL eksik veya hatalý.");
        return "/login-error";
    }
};