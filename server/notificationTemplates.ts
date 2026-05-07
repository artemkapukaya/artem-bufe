/**
 * Sipariş durumu değişikliklerine göre bildirim şablonları
 * Her durum için SMS, e-posta ve push notification mesajları
 */

export type OrderStatusType = "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled";

export interface NotificationTemplate {
  sms: string;
  email: {
    subject: string;
    body: string;
  };
  push: string;
}

export const notificationTemplates: Record<OrderStatusType, NotificationTemplate> = {
  pending: {
    sms: "Siparişiniz alındı. Sipariş No: #ORDER_ID. En kısa sürede hazırlanmaya başlanacaktır.",
    email: {
      subject: "Siparişiniz Alındı - ARTEM BÜFE",
      body: `
Merhaba,

Siparişiniz başarıyla alındı!

Sipariş No: #ORDER_ID
Toplam Tutar: #AMOUNT TL
Ödeme Yöntemi: #PAYMENT_METHOD

Siparişiniz en kısa sürede hazırlanmaya başlanacaktır. Durumu takip etmek için hesabınıza giriş yapabilirsiniz.

Teşekkür ederiz,
ARTEM BÜFE Ekibi
      `,
    },
    push: "Siparişiniz alındı! Hazırlanmaya başlanacaktır.",
  },
  preparing: {
    sms: "Siparişiniz hazırlanıyor! Sipariş No: #ORDER_ID. Yakında yola çıkacaktır.",
    email: {
      subject: "Siparişiniz Hazırlanıyor - ARTEM BÜFE",
      body: `
Merhaba,

Siparişiniz şu anda hazırlanıyor!

Sipariş No: #ORDER_ID
Durum: Hazırlanıyor

Siparişiniz yakında yola çıkacaktır. Lütfen sabırlı olunuz.

ARTEM BÜFE Ekibi
      `,
    },
    push: "Siparişiniz hazırlanıyor! Yakında yola çıkacaktır.",
  },
  on_the_way: {
    sms: "Siparişiniz yolda! Sipariş No: #ORDER_ID. Kurye: #COURIER_NAME, Tel: #COURIER_PHONE",
    email: {
      subject: "Siparişiniz Yolda - ARTEM BÜFE",
      body: `
Merhaba,

Siparişiniz yolda!

Sipariş No: #ORDER_ID
Durum: Yolda
Kurye: #COURIER_NAME
Telefon: #COURIER_PHONE

Siparişiniz kısa süre içinde teslim edilecektir.

ARTEM BÜFE Ekibi
      `,
    },
    push: "Siparişiniz yolda! Kurye yakında gelecek.",
  },
  delivered: {
    sms: "Siparişiniz teslim edildi! Teşekkür ederiz. Sipariş No: #ORDER_ID",
    email: {
      subject: "Siparişiniz Teslim Edildi - ARTEM BÜFE",
      body: `
Merhaba,

Siparişiniz başarıyla teslim edildi!

Sipariş No: #ORDER_ID
Durum: Teslim Edildi

Lütfen siparişinizi kontrol edin ve memnun kalıp kalmadığınızı bize bildirin.

Teşekkür ederiz,
ARTEM BÜFE Ekibi
      `,
    },
    push: "Siparişiniz teslim edildi! Teşekkür ederiz.",
  },
  cancelled: {
    sms: "Siparişiniz iptal edildi. Sipariş No: #ORDER_ID. Detaylar için lütfen bize ulaşın.",
    email: {
      subject: "Siparişiniz İptal Edildi - ARTEM BÜFE",
      body: `
Merhaba,

Siparişiniz iptal edilmiştir.

Sipariş No: #ORDER_ID
Durum: İptal Edildi

Herhangi bir sorunuz varsa, lütfen müşteri hizmetlerimizle iletişime geçin.

ARTEM BÜFE Ekibi
      `,
    },
    push: "Siparişiniz iptal edildi. Detaylar için uygulamayı açın.",
  },
};

/**
 * Şablondaki placeholder'ları gerçek verilerle değiştirir
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `#${key.toUpperCase()}`;
    result = result.replace(new RegExp(placeholder, "g"), String(value));
  });
  return result;
}

/**
 * Belirtilen durum ve kanal için bildirim mesajını oluşturur
 */
export function getNotificationMessage(
  status: OrderStatusType,
  channel: "sms" | "email" | "push",
  variables: Record<string, string | number>
): string | { subject: string; body: string } {
  const template = notificationTemplates[status];
  
  if (channel === "email") {
    return {
      subject: replaceTemplateVariables(template.email.subject, variables),
      body: replaceTemplateVariables(template.email.body, variables),
    };
  }
  
  const message = channel === "sms" ? template.sms : template.push;
  return replaceTemplateVariables(message, variables);
}
