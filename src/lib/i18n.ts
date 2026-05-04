import { create } from "zustand";

export type Lang = "en" | "ar";

type LangState = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

export const useLang = create<LangState>()((set) => ({
  lang: (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) || "ar",
  setLang: (lang) => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    set({ lang });
  },
}));

// ─── Translation dictionary ───────────────────────────────────────
const dict = {
  // Nav & Header
  "nav.shop": { en: "Shop", ar: "المتجر" },
  "nav.story": { en: "Our Story", ar: "قصتنا" },
  "nav.contact": { en: "Contact", ar: "تواصل معنا" },
  "nav.admin": { en: "Admin", ar: "الإدارة" },
  "nav.search": { en: "Search vitality…", ar: "ابحث عن منتج…" },
  "nav.signin": { en: "Sign in / Sign up", ar: "تسجيل الدخول / إنشاء حساب" },
  "nav.myaccount": { en: "My account", ar: "حسابي" },
  "nav.admindash": { en: "Admin dashboard", ar: "لوحة الإدارة" },
  "nav.signout": { en: "Sign out", ar: "تسجيل الخروج" },

  // Admin Dashboard
  "admin.dashboard": { en: "Dashboard", ar: "لوحة القيادة" },
  "admin.products": { en: "Products", ar: "المنتجات" },
  "admin.categories": { en: "Categories", ar: "الفئات" },
  "admin.orders": { en: "Orders", ar: "الطلبات" },
  "admin.accounts": { en: "Accounts", ar: "الحسابات" },
  "admin.shipping": { en: "Shipping rates", ar: "أسعار الشحن" },
  "admin.banners": { en: "Banners", ar: "اللافتات" },
  "admin.settings": { en: "Site Settings", ar: "إعدادات الموقع" },
  "admin.totalsales": { en: "Total Sales", ar: "إجمالي المبيعات" },
  "admin.pending": { en: "Pending Orders", ar: "الطلبات المعلقة" },
  "admin.lowstock": { en: "Low Stock Alerts", ar: "تنبيهات نقص المخزون" },
  "admin.only": { en: "Admins only", ar: "للمسؤولين فقط" },
  "admin.only.sub": {
    en: "You're signed in as a {role}. This dashboard is reserved for admin accounts — please ask an administrator to upgrade your role if you need access.",
    ar: "لقد قمت بتسجيل الدخول كـ {role}. لوحة القيادة هذه مخصصة لحسابات المسؤولين — يرجى طلب ترقية دورك من المسؤول إذا كنت بحاجة إلى الوصول.",
  },
  "admin.orders.count": { en: "{count} orders", ar: "{count} طلبات" },
  "admin.needsfulfillment": { en: "Needs fulfillment", ar: "يحتاج للتنفيذ" },
  "admin.items.count": { en: "{count} Items", ar: "{count} عناصر" },
  "admin.actionrequired": { en: "Action required", ar: "إجراء مطلوب" },

  // Home page
  "home.shopnow": { en: "Shop Now →", ar: "تسوق الآن ←" },
  "home.ourstory": { en: "Our Story", ar: "قصتنا" },
  "home.featured": { en: "Featured Harvest", ar: "المحصول المميز" },
  "home.featured.sub": {
    en: "Hand-picked by our team — updated weekly.",
    ar: "مختارات فريقنا — تتحدث أسبوعياً.",
  },
  "home.viewall": { en: "View all collection →", ar: "← عرض المجموعة الكاملة" },
  "home.addtocart": { en: "Add to Cart", ar: "أضف إلى السلة" },
  "home.featured.badge": { en: "Featured", ar: "مميز" },
  "home.newsletter.title": { en: "Join the {name} Circle", ar: "انضم إلى دائرة {name}" },
  "home.newsletter.sub": {
    en: "Get seasonal recipes, wellness tips, and exclusive early access to our limited harvests delivered to your inbox.",
    ar: "احصل على وصفات موسمية، نصائح صحية، وصول مبكر حصري لمحاصيلنا المحدودة مباشرة إلى بريدك.",
  },
  "home.subscribe": { en: "Subscribe", ar: "اشترك" },
  "home.thanks": { en: "Thanks for subscribing!", ar: "شكراً لاشتراكك!" },

  // Shop page
  "shop.title": { en: "Our Harvest", ar: "منتجاتنا" },
  "shop.subtitle": {
    en: "Selected fresh produce and essentials for your vitality.",
    ar: "منتجات طازجة مختارة لحيويتك.",
  },
  "shop.categories": { en: "Categories", ar: "الفئات" },
  "shop.all": { en: "All Products", ar: "جميع المنتجات" },
  "shop.dietary": { en: "Dietary Needs", ar: "الاحتياجات الغذائية" },
  "shop.pricerange": { en: "Price Range", ar: "نطاق السعر" },
  "shop.sortby": { en: "Sort by:", ar: "ترتيب حسب:" },
  "shop.latest": { en: "Latest Harvest", ar: "أحدث المحاصيل" },
  "shop.priceasc": { en: "Price: Low to High", ar: "السعر: من الأقل إلى الأعلى" },
  "shop.pricedesc": { en: "Price: High to Low", ar: "السعر: من الأعلى إلى الأقل" },
  "shop.nomatch": { en: "No products match your filters.", ar: "لا توجد منتجات تطابق معاييرك." },

  // Product detail
  "product.qty": { en: "Select Quantity", ar: "اختر الكمية" },
  "product.addtocart": { en: "Add to Cart", ar: "أضف إلى السلة" },
  "product.nutrition": { en: "Nutrition Facts", ar: "القيمة الغذائية" },
  "product.organic": { en: "100% Organic", ar: "عضوي 100%" },
  "product.fresh": { en: "Farm Fresh", ar: "طازج من المزرعة" },
  "product.washed": { en: "Pre-Washed", ar: "مغسول مسبقاً" },
  "product.related": { en: "Picks for your Wellness", ar: "اختيارات لعافيتك" },
  "product.related.sub": {
    en: "Complete your basket with these fresh additions.",
    ar: "أكمل سلتك بهذه الإضافات الطازجة.",
  },
  "product.viewshop": { en: "View full shop →", ar: "← عرض المتجر الكامل" },
  "product.notfound": { en: "Product not found", ar: "المنتج غير موجود" },
  "product.backshop": { en: "← Back to shop", ar: "العودة إلى المتجر →" },
  "product.buynow": { en: "Buy Now", ar: "اشتري الآن" },
  "product.outofstock": { en: "Out of Stock", ar: "نفذت الكمية" },

  // Cart
  "cart.title": { en: "Your Harvest Basket", ar: "سلة مشترياتك" },
  "cart.subtitle": {
    en: "Review your curated selection before checkout.",
    ar: "راجع اختياراتك قبل الدفع.",
  },
  "cart.empty": { en: "Your basket is empty", ar: "سلتك فارغة" },
  "cart.empty.sub": {
    en: "Explore our fresh harvest and add items to get started.",
    ar: "استكشف محصولنا الطازج وأضف منتجات للبدء.",
  },
  "cart.browse": { en: "Browse harvest", ar: "تصفح المحصول" },
  "cart.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "cart.shipping": { en: "Shipping", ar: "الشحن" },
  "cart.shipping.estimate": { en: "Est. Shipping", ar: "الشحن التقديري" },
  "cart.shipping.disclaimer": {
    en: "Estimated for home delivery. Final shipping is confirmed at checkout.",
    ar: "تقدير للتوصيل المنزلي. سيتم تأكيد الشحن النهائي عند الدفع.",
  },
  "cart.total": { en: "Estimated Total", ar: "الإجمالي المقدّر" },
  "cart.checkout": { en: "Proceed to Checkout", ar: "المتابعة للدفع" },
  "cart.secure": { en: "Secure checkout", ar: "دفع آمن" },
  "cart.guarantee": { en: "30-day freshness guarantee", ar: "ضمان النضارة لمدة 30 يوم" },
  "cart.sustainable": { en: "Sustainably packaged", ar: "تغليف مستدام" },
  "cart.continue": { en: "Continue shopping", ar: "تابع التسوق" },
  "cart.items": { en: "items", ar: "منتجات" },

  // Checkout
  "checkout.title": { en: "Secure Checkout", ar: "الدفع الآمن" },
  "checkout.empty": { en: "Nothing to check out", ar: "لا يوجد شيء للدفع" },
  "checkout.empty.sub": {
    en: "Add some fresh produce to your basket first.",
    ar: "أضف بعض المنتجات الطازجة إلى سلتك أولاً.",
  },
  "checkout.backtoshop": { en: "Back to shop", ar: "العودة إلى المتجر" },
  "checkout.shipping": { en: "Shipping", ar: "الشحن" },
  "checkout.payment": { en: "Payment", ar: "الدفع" },
  "checkout.review": { en: "Review", ar: "مراجعة" },
  "checkout.express": { en: "Express (2-3 days)", ar: "سريع (2-3 أيام)" },
  "checkout.standard": { en: "Standard (5-7 days)", ar: "عادي (5-7 أيام)" },
  "checkout.card": { en: "Credit / Debit Card", ar: "بطاقة ائتمان / خصم" },
  "checkout.paypal": { en: "PayPal", ar: "باي بال" },
  "checkout.fullname": { en: "Full name", ar: "الاسم الكامل" },
  "checkout.street": { en: "Street address", ar: "العنوان" },
  "checkout.city": { en: "City", ar: "المدينة" },
  "checkout.zip": { en: "Zip / Postal code", ar: "الرمز البريدي" },
  "checkout.cardnumber": { en: "Card number", ar: "رقم البطاقة" },
  "checkout.expiry": { en: "MM / YY", ar: "شهر / سنة" },
  "checkout.cvv": { en: "CVV", ar: "CVV" },
  "checkout.ordersummary": { en: "Order Summary", ar: "ملخص الطلب" },
  "checkout.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "checkout.tax": { en: "Tax", ar: "الضريبة" },
  "checkout.total": { en: "Total", ar: "الإجمالي" },
  "checkout.placeorder": { en: "Place Order", ar: "تأكيد الطلب" },
  "checkout.encrypted": { en: "256-bit encrypted", ar: "تشفير 256 بت" },
  "checkout.phone": { en: "Phone Number", ar: "رقم الهاتف" },
  "checkout.email": {
    en: "Email (Optional for tracking)",
    ar: "البريد الإلكتروني (اختياري للتتبع)",
  },
  "checkout.wilaya": { en: "Wilaya", ar: "الولاية" },
  "checkout.address": { en: "Detailed Address", ar: "العنوان بالتفصيل" },
  "checkout.shippingmethod": { en: "Shipping Method", ar: "طريقة الشحن" },
  "checkout.shippingcompany": { en: "Shipping Company", ar: "شركة الشحن" },
  "checkout.deskdelivery": {
    en: "Desk Delivery (Point de relais)",
    ar: "توصيل للمكتب (نقطة استلام)",
  },
  "checkout.homedelivery": { en: "Home Delivery (A domicile)", ar: "توصيل للمنزل (إلى الباب)" },
  "checkout.cod": { en: "Cash on Delivery (COD)", ar: "الدفع عند الاستلام" },
  "checkout.cod.sub": {
    en: "You will pay when the order is delivered to your selected location.",
    ar: "ستدفع عند تسليم الطلب إلى موقعك المحدد.",
  },
  "checkout.secure": { en: "Secure checkout process", ar: "عملية دفع آمنة" },

  // Account
  "auth.welcome": { en: "Welcome back", ar: "مرحباً بعودتك" },
  "auth.create": { en: "Create your account", ar: "أنشئ حسابك" },
  "auth.login.sub": {
    en: "Sign in to view orders and manage addresses.",
    ar: "سجل دخولك لعرض الطلبات وإدارة العناوين.",
  },
  "auth.signup.sub": {
    en: "Join Ruba Nova for faster checkout and saved orders.",
    ar: "انضم إلى روبا نوفا لدفع أسرع وطلبات محفوظة.",
  },
  "auth.fullname": { en: "Full name", ar: "الاسم الكامل" },
  "auth.email": { en: "Email", ar: "البريد الإلكتروني" },
  "auth.password": { en: "Password", ar: "كلمة المرور" },
  "auth.signin": { en: "Sign in", ar: "تسجيل الدخول" },
  "auth.createaccount": { en: "Create account", ar: "إنشاء حساب" },
  "auth.needaccount": { en: "Need an account? Sign up", ar: "تحتاج حساب؟ سجّل الآن" },
  "auth.havaccount": { en: "Already have an account? Sign in", ar: "لديك حساب؟ سجل دخولك" },
  "auth.wait": { en: "Please wait…", ar: "يرجى الانتظار…" },
  "auth.myaccount": { en: "My account", ar: "حسابي" },
  "auth.welcomeback": { en: "Welcome back,", ar: "مرحباً بعودتك،" },
  "auth.orders": { en: "Order History", ar: "سجل الطلبات" },
  "auth.addresses": { en: "Saved Addresses", ar: "العناوين المحفوظة" },
  "auth.profile": { en: "Profile", ar: "الملف الشخصي" },
  "auth.noorders": {
    en: "No orders yet. Time to fill your basket.",
    ar: "لا توجد طلبات بعد. حان وقت ملء سلتك.",
  },
  "auth.order": { en: "Order", ar: "طلب" },
  "auth.viewreceipt": { en: "View receipt", ar: "عرض الإيصال" },
  "auth.addaddress": { en: "Add new address", ar: "إضافة عنوان جديد" },
  "auth.default": { en: "Default", ar: "الافتراضي" },
  "auth.makedefault": { en: "Make default", ar: "جعله الافتراضي" },
  "auth.label": { en: "Label", ar: "التسمية" },
  "auth.saveaddress": { en: "Save address", ar: "حفظ العنوان" },
  "auth.cancel": { en: "Cancel", ar: "إلغاء" },
  "auth.profiledetails": { en: "Profile details", ar: "تفاصيل الملف الشخصي" },
  "auth.savechanges": { en: "Save changes", ar: "حفظ التغييرات" },
  "auth.profileupdated": { en: "Profile updated.", ar: "تم تحديث الملف الشخصي." },

  // About
  "about.badge": { en: "Our Philosophy", ar: "فلسفتنا" },
  "about.title": { en: "Rooted in", ar: "جذورنا في" },
  "about.titleaccent": { en: "Honest Sourcing", ar: "المصادر الأمينة" },
  "about.p1": {
    en: "Ruba Nova began as a weekend stall at the Portland Farmers Market — three crates of heirloom tomatoes, a hand-painted sign, and an unshakable belief that food should nourish both people and the planet.",
    ar: "بدأت روبا نوفا كمحل صغير في سوق المزارعين — ثلاث صناديق من الطماطم الموروثة، لافتة مرسومة يدوياً، وإيمان راسخ بأن الغذاء يجب أن يغذي الناس والكوكب معاً.",
  },
  "about.p2": {
    en: "Today we partner with over 40 regenerative farms across the Pacific Northwest to bring you seasonal produce that is never sprayed, never waxed, and always picked at peak ripeness.",
    ar: "اليوم نتعاون مع أكثر من 40 مزرعة مستدامة لنقدم لك منتجات موسمية لم تُرش أبداً، ولم تُشمّع أبداً، وتُقطف دائماً في ذروة نضجها.",
  },
  "about.p3": {
    en: "Every box we ship is plastic-free, every delivery route is carbon-offset, and every penny of profit beyond operating costs goes back into soil health initiatives. That's the Ruba Nova promise.",
    ar: "كل صندوق نشحنه خالٍ من البلاستيك، كل مسار توصيل يعوّض الكربون، وكل فلس ربح يعود إلى مبادرات صحة التربة. هذا وعد روبا نوفا.",
  },
  "about.cta": { en: "Explore our harvest →", ar: "← استكشف محصولنا" },

  // Contact
  "contact.title": { en: "Get in Touch", ar: "تواصل معنا" },
  "contact.subtitle": {
    en: "Whether you have a question, wholesale inquiry, or just want to say hello — we'd love to hear from you.",
    ar: "سواء كان لديك سؤال، استفسار عن الجملة، أو مجرد تحية — يسعدنا سماعك.",
  },
  "contact.visit": { en: "Visit Our Shop", ar: "زُر متجرنا" },
  "contact.hours": { en: "Mon–Sat 8 AM – 6 PM", ar: "الإثنين–السبت 8 صباحاً – 6 مساءً" },
  "contact.email": { en: "Email Us", ar: "راسلنا" },
  "contact.reply": { en: "We reply within 24 hours", ar: "نرد خلال 24 ساعة" },
  "contact.call": { en: "Call Us", ar: "اتصل بنا" },
  "contact.available": { en: "Available during shop hours", ar: "متاح خلال أوقات العمل" },
  "contact.sendmsg": { en: "Send Us a Message", ar: "أرسل لنا رسالة" },
  "contact.name": { en: "Name", ar: "الاسم" },
  "contact.message": { en: "Message", ar: "الرسالة" },
  "contact.send": { en: "Send message", ar: "أرسل الرسالة" },
  "contact.sent": { en: "Thanks! We'll be in touch soon.", ar: "شكراً! سنتواصل معك قريباً." },

  // Loading
  loading: { en: "Loading fresh harvest…", ar: "جارٍ تحميل المحصول الطازج…" },

  // 404
  "notfound.title": { en: "Page not found", ar: "الصفحة غير موجودة" },
  "notfound.sub": {
    en: "The page you're looking for doesn't exist or has been moved.",
    ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  },
  "notfound.back": { en: "Back to home", ar: "العودة للرئيسية" },

  // Footer
  "footer.shop": { en: "Shop", ar: "المتجر" },
  "footer.about": { en: "About", ar: "عن روبا نوفا" },
  "footer.contact": { en: "Contact", ar: "تواصل معنا" },

  // Order confirmation
  "order.confirmed": { en: "Order Confirmed!", ar: "تم تأكيد الطلب!" },
  "order.thankyou": { en: "Thank you for your order", ar: "شكراً لطلبك" },
  "order.notfound": { en: "Order not found", ar: "الطلب غير موجود" },

  // Misc
  "misc.shippedto": { en: "Shipped to", ar: "الشحن إلى" },
  "misc.expressShipping": { en: "Express", ar: "سريع" },
  "misc.standardShipping": { en: "Standard", ar: "عادي" },

  // Language
  "lang.en": { en: "English", ar: "English" },
  "lang.ar": { en: "العربية", ar: "العربية" },

  // Mobile Nav
  "mobile.home": { en: "Home", ar: "الرئيسية" },
  "mobile.catalog": { en: "Catalog", ar: "المتجر" },
  "mobile.cart": { en: "Cart", ar: "السلة" },
  "mobile.orders": { en: "Orders", ar: "الطلبات" },

  // Toast notifications
  "toast.added": { en: "Added to cart", ar: "أُضيف إلى السلة" },
  "toast.removed": { en: "Removed from cart", ar: "أُزيل من السلة" },
} as const;

export type TKey = keyof typeof dict;

export function t(key: TKey, lang: Lang, vars?: Record<string, string>): string {
  let str = dict[key]?.[lang] ?? dict[key]?.en ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

/** Format a price in Algerian Dinar */
export function formatPrice(amount: number, lang: Lang): string {
  const formatted = amount.toFixed(2);
  return lang === "ar" ? `${formatted} د.ج` : `${formatted} DA`;
}

/** Hook: returns the current t() bound to active lang */
export function useT() {
  const lang = useLang((s) => s.lang);
  return {
    t: (key: TKey, vars?: Record<string, string>) => t(key, lang, vars),
    p: (amount: number) => formatPrice(amount, lang),
    lang,
    isRTL: lang === "ar",
  };
}
