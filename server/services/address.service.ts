export type OrderStatusType = "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled";

// Admin & Auth
export const verifyAdminCredentials = async (u: string, p: string) => u === "admin" && p === "admin123";
export const updateAdminPassword = async (u: string, n: string) => true;
export const getAdminByUsername = async (u: string) => ({ id: 1, username: u });

// Loyalty & Orders
export const getOrCreateLoyaltyProfile = async (id: number) => ({ userId: id, points: 0 });
export const getLoyaltyProfile = async (id: number) => ({ userId: id, points: 0 });
export const createOrder = async (d: any) => ({ id: 1, ...d });
export const completeOrder = async (id: number) => true;
export const getUserOrders = async (id: number) => [];
export const updateOrderStatus = async (id: number, s: OrderStatusType) => true;
export const getOrderStatusHistory = async (id: number) => [];
export const getLatestOrderStatus = async (id: number) => "pending";

// Adres Fonksiyonlarý
export const createCustomerAddress = async (d: any) => ({ id: 1, ...d });
export const getCustomerAddresses = async (id: number) => [];
export const getDefaultAddress = async (id: number) => null;

// Diðer Gerekli Fonksiyonlar
export const getPointHistory = async (u: number) => [];
export const addBonusPoints = async (u: number, p: number) => true;
export const getActiveRewards = async () => [];
export const redeemReward = async (u: number, r: number, p: number) => ({ success: true });
export const getUserRedeemedRewards = async (u: number) => [];
export const useRedeemedReward = async (c: string) => true;
export const createSmsVerification = async (p: string, c: string, e: Date) => true;
export const verifySmsCode = async (p: string, c: string) => true;
export const sendOrderStatusNotification = async (...args: any[]) => true;
export const getOrderNotifications = async (id: number) => [];
export const getPendingNotifications = async () => [];