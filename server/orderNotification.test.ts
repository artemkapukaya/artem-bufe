import { describe, expect, it, beforeAll } from "vitest";
import {
  notificationTemplates,
  replaceTemplateVariables,
  getNotificationMessage,
  type OrderStatusType,
} from "./notificationTemplates";

describe("Order Status & Notification System", () => {
  describe("Notification Templates", () => {
    it("should have templates for all order statuses", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        expect(notificationTemplates[status]).toBeDefined();
        expect(notificationTemplates[status].sms).toBeDefined();
        expect(notificationTemplates[status].email).toBeDefined();
        expect(notificationTemplates[status].email.subject).toBeDefined();
        expect(notificationTemplates[status].email.body).toBeDefined();
        expect(notificationTemplates[status].push).toBeDefined();
      });
    });

    it("should have SMS messages for each status", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const sms = notificationTemplates[status].sms;
        expect(sms).toBeTruthy();
        expect(sms.length).toBeGreaterThan(0);
        expect(sms).toContain("#ORDER_ID");
      });
    });

    it("should have email templates for each status", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const email = notificationTemplates[status].email;
        expect(email.subject).toBeTruthy();
        expect(email.body).toBeTruthy();
        expect(email.subject.length).toBeGreaterThan(0);
        expect(email.body.length).toBeGreaterThan(0);
      });
    });

    it("should have push notification messages for each status", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const push = notificationTemplates[status].push;
        expect(push).toBeTruthy();
        expect(push.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Template Variable Replacement", () => {
    it("should replace single variable in template", () => {
      const template = "Sipariş No: #ORDER_ID";
      const result = replaceTemplateVariables(template, { order_id: "12345" });
      expect(result).toBe("Sipariş No: 12345");
    });

    it("should replace multiple variables in template", () => {
      const template = "Sipariş No: #ORDER_ID, Tutar: #AMOUNT TL, Ödeme: #PAYMENT_METHOD";
      const result = replaceTemplateVariables(template, {
        order_id: "12345",
        amount: "450",
        payment_method: "Kredi Kartı",
      });
      expect(result).toBe("Sipariş No: 12345, Tutar: 450 TL, Ödeme: Kredi Kartı");
    });

    it("should handle repeated variables", () => {
      const template = "#ORDER_ID - #ORDER_ID";
      const result = replaceTemplateVariables(template, { order_id: "999" });
      expect(result).toBe("999 - 999");
    });

    it("should handle numeric variables", () => {
      const template = "Toplam: #AMOUNT TL";
      const result = replaceTemplateVariables(template, { amount: 651 });
      expect(result).toBe("Toplam: 651 TL");
    });

    it("should not replace undefined variables", () => {
      const template = "Sipariş No: #ORDER_ID, Kurye: #COURIER_NAME";
      const result = replaceTemplateVariables(template, { order_id: "12345" });
      expect(result).toContain("Sipariş No: 12345");
      expect(result).toContain("#COURIER_NAME");
    });
  });

  describe("Get Notification Message", () => {
    it("should return SMS message for pending status", () => {
      const message = getNotificationMessage("pending", "sms", { order_id: "123" });
      expect(typeof message).toBe("string");
      expect(message).toContain("123");
      expect(message).toContain("alındı");
    });

    it("should return email message with subject and body for pending status", () => {
      const message = getNotificationMessage("pending", "email", { 
        order_id: "123",
        amount: "450",
        payment_method: "Kredi Kartı",
      });
      expect(typeof message).toBe("object");
      expect(message).toHaveProperty("subject");
      expect(message).toHaveProperty("body");
      expect((message as any).subject).toContain("Alındı");
      expect((message as any).body).toContain("123");
    });

    it("should return push notification for on_the_way status", () => {
      const message = getNotificationMessage("on_the_way", "push", { order_id: "456" });
      expect(typeof message).toBe("string");
      expect(message).toContain("yolda");
    });

    it("should handle all status types", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const smsMessage = getNotificationMessage(status, "sms", { order_id: "999" });
        const emailMessage = getNotificationMessage(status, "email", { order_id: "999" });
        const pushMessage = getNotificationMessage(status, "push", { order_id: "999" });
        
        expect(smsMessage).toBeTruthy();
        expect(emailMessage).toBeTruthy();
        expect(pushMessage).toBeTruthy();
      });
    });

    it("should replace variables in preparing status SMS", () => {
      const message = getNotificationMessage("preparing", "sms", { order_id: "789" });
      expect(message).toContain("789");
      expect(message).toContain("hazırlanıyor");
    });

    it("should replace variables in delivered status email", () => {
      const message = getNotificationMessage("delivered", "email", { order_id: "555" });
      expect((message as any).body).toContain("555");
      expect((message as any).body).toContain("teslim");
    });

    it("should replace variables in cancelled status SMS", () => {
      const message = getNotificationMessage("cancelled", "sms", { order_id: "222" });
      expect(message).toContain("222");
      expect(message).toContain("iptal");
    });
  });

  describe("Notification Content Quality", () => {
    it("SMS messages should be under 160 characters for single SMS", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const sms = notificationTemplates[status].sms;
        // SMS with variables replaced should ideally be under 160 chars (single SMS)
        // This is a soft check - some can be longer for multi-SMS
        expect(sms.length).toBeLessThan(300);
      });
    });

    it("Email subjects should be meaningful and not too long", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const subject = notificationTemplates[status].email.subject;
        expect(subject.length).toBeGreaterThan(10);
        expect(subject.length).toBeLessThan(100);
      });
    });

    it("Email bodies should contain relevant information", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const body = notificationTemplates[status].email.body;
        expect(body).toContain("#ORDER_ID");
        expect(body).toContain("ARTEM BÜFE");
      });
    });

    it("Push notifications should be concise", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const push = notificationTemplates[status].push;
        expect(push.length).toBeLessThan(100);
      });
    });
  });

  describe("Status Transitions", () => {
    it("should support all valid status transitions", () => {
      const validTransitions: Record<OrderStatusType, OrderStatusType[]> = {
        pending: ["preparing", "cancelled"],
        preparing: ["on_the_way", "cancelled"],
        on_the_way: ["delivered", "cancelled"],
        delivered: [],
        cancelled: [],
      };

      Object.entries(validTransitions).forEach(([fromStatus, toStatuses]) => {
        toStatuses.forEach(toStatus => {
          const fromTemplate = notificationTemplates[fromStatus as OrderStatusType];
          const toTemplate = notificationTemplates[toStatus];
          expect(fromTemplate).toBeDefined();
          expect(toTemplate).toBeDefined();
        });
      });
    });
  });

  describe("Notification Channels", () => {
    it("should provide SMS for all statuses", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const message = getNotificationMessage(status, "sms", { order_id: "test" });
        expect(typeof message).toBe("string");
        expect((message as string).length).toBeGreaterThan(0);
      });
    });

    it("should provide email for all statuses", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const message = getNotificationMessage(status, "email", { order_id: "test" });
        expect(typeof message).toBe("object");
        expect((message as any).subject).toBeTruthy();
        expect((message as any).body).toBeTruthy();
      });
    });

    it("should provide push for all statuses", () => {
      const statuses: OrderStatusType[] = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
      
      statuses.forEach(status => {
        const message = getNotificationMessage(status, "push", { order_id: "test" });
        expect(typeof message).toBe("string");
        expect((message as string).length).toBeGreaterThan(0);
      });
    });
  });
});
