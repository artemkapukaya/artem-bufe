import { router, publicProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import * as db from "./db";

// Ürünler için router - DB tabanlı
const adminProductsRouter = router({
    list: publicProcedure.query(async () => {
        return await db.getCustomProductsFromDB();
    }),
    save: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional().default(""),
            price: z.number(),
            image: z.string().optional().default(""),
            category: z.string(),
            hasOptions: z.boolean().optional().default(false),
        }))
        .mutation(async ({ input }) => {
            return await db.saveCustomProductToDB(input);
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await db.deleteCustomProductFromDB(input.id);
        }),
});

// Kategori router - DB tabanlı
const adminCategoriesRouter = router({
    list: publicProcedure.query(async () => {
        return await db.getCategoryOverridesFromDB();
    }),
    save: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional().default(""),
            image: z.string().optional().default(""),
            icon: z.string().optional().default("🍽️"),
            isCustom: z.boolean().optional().default(false),
        }))
        .mutation(async ({ input }) => {
            return await db.saveCategoryOverrideToDB(input.id, input);
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await db.deleteCategoryFromDB(input.id);
        }),
});



// Siparişler için router tanımı
const adminOrdersRouter = router({
    list: publicProcedure.query(async () => {
        return await db.getAllOrdersForAdmin();
    }),
    updateStatus: publicProcedure
        .input(z.object({ id: z.number(), status: z.string() }))
        .mutation(async ({ input }) => {
            return await db.updateOrderStatus(input.id, input.status);
        }),
    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            return await db.deleteOrder(input.id);
        }),
    create: publicProcedure
        .input(z.object({
            totalAmount: z.number(),
            statusNotes: z.string().optional(),
            orderNumber: z.string(),
        }))
        .mutation(async ({ input }) => {
            return await db.createOrder({
                totalAmount: input.totalAmount,
                statusNotes: input.statusNotes ?? "",
                orderNumber: input.orderNumber,
            });
        }),
});

// Kimlik doğrulama için router tanımı
const authRouter = router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return { success: true } as const;
    }),
});

// Ana router birleştirme
export const appRouter = router({
    system: systemRouter,
    auth: authRouter,
    adminOrders: adminOrdersRouter,
    adminProducts: adminProductsRouter,
    adminCategories: adminCategoriesRouter,
});

export type AppRouter = typeof appRouter;
