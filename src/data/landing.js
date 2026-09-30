// ─── LANDING PAGE STATIC DATA ──────────────────────────────
// Content arrays moved verbatim out of views/LandingView.vue.
// Labels starting with e.g. "owner_" / "faq_" are i18n keys resolved
// in each section component via i18n.t.xxx.

export const stats = [
  { value: "0៛", label: "owner_no_printing" },
  { value: "1 min", label: "owner_fast_update" },
  { value: "QR", label: "owner_less_mistake" },
];

export const ownerBenefits = [
  { value: "01", title: "owner_reprint_title", desc: "owner_reprint_desc" },
  { value: "02", title: "owner_order_title", desc: "owner_order_desc" },
  { value: "03", title: "owner_telegram_title", desc: "owner_telegram_desc" },
  { value: "04", title: "owner_guest_title", desc: "owner_guest_desc" },
];

export const features = [
  { key: "digital_menu", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h6M9 11h6M9 15h4'/></svg>" },
  { key: "qr_code", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 1h2v2h-2v-2Zm3 3h2v2h-2v-2Zm-4 0h2v2h-2v-2Z'/></svg>" },
  { key: "telegram", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z'/></svg>" },
  { key: "bilingual", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 5h9M9 3v2m1 0c-.5 4-2.4 7-6 9m3.2-5.2c1 1.9 2.7 3.6 5 5.2M14 21l1.2-3h4.6L21 21m-4-7-1.8 4h4.6L18 14Z'/></svg>" },
  { key: "multi_restaurant", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 10h16l-1-5H5l-1 5Zm1 0v10h14V10M8 20v-6h4v6m4 0v-6h2'/></svg>" },
  { key: "analytics", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 19V5m0 14h17M8 16v-5m5 5V8m5 8v-7'/></svg>" },
];

export const steps = [
  { title: "register_acc_title", desc: "register_acc_desc" },
  { title: "setup_menu_title", desc: "setup_menu_desc" },
  { title: "qr_code_title", desc: "qr_code_desc" },
  { title: "receive_orders_title", desc: "receive_orders_desc" },
];

// FAQ question/answer i18n keys.
export const faqs = [
  { q: "faq_1_q", a: "faq_1_a" },
  { q: "faq_2_q", a: "faq_2_a" },
  { q: "faq_3_q", a: "faq_3_a" },
  { q: "faq_4_q", a: "faq_4_a" },
];

export const sampleFoods = [
  {
    id: 1,
    name: "ស្ងោរជ្រក់មាន់",
    price: 30000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560052334_1491890335269845_8989493767183977872_n_v6osxh.jpg",
  },
  {
    id: 2,
    name: "ត្រីបំពង",
    price: 20000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560100192_1294493769028479_7023791370470250097_n_q8rlo8.jpg",
  },
  {
    id: 3,
    name: "កង្កែបបោក",
    price: 10000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/maxresdefault_7_dn2dax.jpg",
  },
  {
    id: 4,
    name: "ភ្លៅមាន់បំពង",
    price: 5000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/DSC_0039_pnh4pf.jpg",
  },
  {
    id: 5,
    name: "ត្រីងៀតបំពង",
    price: 4000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/79600669_1434979050004558_994592641955921920_n_nbkm2a.jpg",
  },
  {
    id: 6,
    name: "បុកអំបិល",
    price: 3000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249571/images_1_khv5yn.jpg",
  },
];
