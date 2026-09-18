// frontend/src/data/demo.js
// ─────────────────────────────────────────────────────────────
// Shared demo data used by the public demo menu + blog pages so
// visitors can try the product experience WITHOUT an account.
// ─────────────────────────────────────────────────────────────

export const DEMO_LOGO_URL =
  "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png";

export const demoCategories = [
  { id: 1, label_km: "ម្ហូបចម្បង", label_en: "Main Dishes", icon: "plate" },
  { id: 2, label_km: "ភេសជ្ជៈ", label_en: "Drinks", icon: "cup" },
  { id: 3, label_km: "បង្អែម", label_en: "Desserts", icon: "candy" },
];

// `img` can be null — the UI then falls back to `icon`, an AppIcon name
// (SVG) rendered by <AppIcon>, so a demo item never shows a broken image.
export const demoFoods = [
  // ── Main dishes ─────────────────────────────────────────────
  {
    id: 101,
    category: 1,
    name: "ស្ងោរជ្រក់មាន់",
    name_en: "Chicken Sour Soup",
    price: 30000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560052334_1491890335269845_8989493767183977872_n_v6osxh.jpg",
    icon: "soup",
  },
  {
    id: 102,
    category: 1,
    name: "ត្រីបំពង",
    name_en: "Deep Fried Fish",
    price: 20000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560100192_1294493769028479_7023791370470250097_n_q8rlo8.jpg",
    icon: "fish",
  },
  {
    id: 103,
    category: 1,
    name: "កង្កែបបោក",
    name_en: "Stir-Fried Frog",
    price: 10000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/maxresdefault_7_dn2dax.jpg",
    icon: "plate",
  },
  {
    id: 104,
    category: 1,
    name: "ភ្លៅមាន់បំពង",
    name_en: "Fried Chicken Leg",
    price: 5000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/DSC_0039_pnh4pf.jpg",
    icon: "burger",
  },
  {
    id: 105,
    category: 1,
    name: "ត្រីងៀតបំពង",
    name_en: "Fried Dried Fish",
    price: 4000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/79600669_1434979050004558_994592641955921920_n_nbkm2a.jpg",
    icon: "fish",
  },
  // ── Drinks ──────────────────────────────────────────────────
  {
    id: 201,
    category: 2,
    name: "ទឹកកកក្រូច",
    name_en: "Iced Orange Juice",
    price: 8000,
    img: null,
    icon: "cup",
  },
  {
    id: 202,
    category: 2,
    name: "កាហ្វេទឹកដោះគោ",
    name_en: "Iced Milk Coffee",
    price: 10000,
    img: null,
    icon: "cup",
  },
  {
    id: 203,
    category: 2,
    name: "ទឹកអំពៅ",
    name_en: "Sugarcane Juice",
    price: 6000,
    img: null,
    icon: "cup",
  },
  {
    id: 204,
    category: 2,
    name: "ស្រាបៀរត្រជាក់",
    name_en: "Cold Beer",
    price: 12000,
    img: null,
    icon: "beer",
  },
  // ── Desserts ────────────────────────────────────────────────
  {
    id: 301,
    category: 3,
    name: "ចេកអាំង",
    name_en: "Grilled Banana",
    price: 4000,
    img: null,
    icon: "banana",
  },
  {
    id: 302,
    category: 3,
    name: "បាយទន្ទឹម",
    name_en: "Sticky Rice Cake",
    price: 6000,
    img: null,
    icon: "rice-ball",
  },
  {
    id: 303,
    category: 3,
    name: "ស្ករក្រឡាច",
    name_en: "Palm Sugar Candy",
    price: 3000,
    img: null,
    icon: "candy",
  },
];

// ─────────────────────────────────────────────────────────────
// Blog posts (demo content, bilingual)
// content: array of blocks — { t: "p"|"h"|"ul", x?: string, xs?: string[] }
// ─────────────────────────────────────────────────────────────
export const demoBlogPosts = [
  {
    slug: "why-digital-menu",
    tag_km: "មីនុយឌីជីថល",
    tag_en: "Digital Menu",
    date: "2026-08-20",
    read_min: 4,
    image:
      "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560052334_1491890335269845_8989493767183977872_n_v6osxh.jpg",
    title_km: "ហេតុអ្វីបានជាហាងអ្នកត្រូវការមីនុយឌីជីថល",
    title_en: "Why your restaurant needs a digital menu",
    excerpt_km:
      "មីនុយក្រដាសលែងស័ក្តិសមទៀតហើយ។ ស្វែងយល់ពីរបៀបដែលមីនុយឌីជីថលជួយសន្សំពេលវេលា ថវិកា និងកាត់បន្ថយកំហុសក្នុងការបញ្ជាទិញ។",
    excerpt_en:
      "Paper menus are outdated. See how a digital menu saves you time, money, and reduces ordering mistakes — starting today.",
    content_km: [
      { t: "p", x: "រាល់ពេលដែលតម្លៃម្ហូបផ្លាស់ប្តូរ ម្ចាស់ហាងត្រូវបោះពុម្ពមីនុយថ្មី រួចបិទបាំង ឬលុបចោលថតចាស់ៗ។ នេះចំណាយទាំងថវិកា ទាំងពេលវេលា ហើយពេលខ្លះអតិថិជននៅតែឃើញតម្លៃចាស់ដដែល។" },
      { t: "h", x: "អត្ថប្រយោជន៍សំខាន់ៗ" },
      {
        t: "ul",
        xs: [
          "កែតម្លៃ និងរូបភាពបានភ្លាមៗ ពីទូរស័ព្ទ ឬកុំព្យូទ័រ",
          "បង្ហាញស្ថានភាព «អស់» ភ្លាមៗ ពេលម្ហូបអស់",
          "អតិថិជនមើលរូបភាព និងតម្លៃច្បាស់ បញ្ជាទិញដោយខ្លួនឯង",
          "ព័ត៌មានថ្មីៗត្រូវបានធ្វើបច្ចុប្បន្នភាពគ្រប់ទីកន្លែងតែម្តង",
        ],
      },
      { t: "h", x: "ចាប់ផ្តើមដោយរបៀបណា?" },
      { t: "p", x: "អ្នកគ្រាន់តែបង្កើតគណនី បន្ថែមម្ហូប និងតម្លៃ រួចបោះពុម្ព QR សម្រាប់តុនីមួយៗ។ អតិថិជនស្កេន ឃើញមីនុយ និងអាចបញ្ជាទិញបានភ្លាម។" },
      { t: "p", x: "សាកល្បងមើលជាមួយផ្ទាំង «មីនុយសាកល្បង» នៅលើទំព័រដើមរបស់យើង មុនពេលសម្រេចចិត្តចុះឈ្មោះ។" },
    ],
    content_en: [
      { t: "p", x: "Every time a price changes, restaurant owners print a new menu, tape over old prices, or hand out outdated paper copies. It costs money, takes time, and guests sometimes still see the old price." },
      { t: "h", x: "The big wins" },
      {
        t: "ul",
        xs: [
          "Update prices and photos instantly from your phone or computer",
          "Mark items sold-out the moment they run out",
          "Guests see real photos and clear prices, then order themselves",
          "One change updates every customer view at the same time",
        ],
      },
      { t: "h", x: "How to get started" },
      { t: "p", x: "Create an account, add your dishes and prices, then print a QR code for each table. Guests scan, browse, and order right away." },
      { t: "p", x: "Try our demo menu on the landing page first — no sign-up needed." },
    ],
  },
  {
    slug: "paper-to-qr-in-one-afternoon",
    tag_km: "ការបញ្ជាទិញតាម QR",
    tag_en: "QR Ordering",
    date: "2026-08-12",
    read_min: 3,
    image:
      "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560100192_1294493769028479_7023791370470250097_n_q8rlo8.jpg",
    title_km: "ពីមីនុយក្រដាសទៅ QR ក្នុងរយៈពេលមួយរសៀល",
    title_en: "From paper menu to QR in one afternoon",
    excerpt_km:
      "មិនចាំបាច់ចំណាយពេលច្រើនទេ។ នេះជាជំហានសាមញ្ញៗ ដើម្បីផ្លាស់ប្តូរហាងរបស់អ្នកឲ្យទៅជាមីនុយ QR ក្នុងរយៈពេលខ្លី។",
    excerpt_en:
      "You don't need a week or a tech team. Here are the simple steps to move your restaurant to QR menus in a single afternoon.",
    content_km: [
      { t: "p", x: "ការផ្លាស់ប្តូរទៅមីនុយ QR ស្តាប់ទៅហាក់ដូចជាស្មុគស្មាញ ប៉ុន្តែការពិតវាសាមញ្ញណាស់។" },
      { t: "h", x: "ជំហានទាំង ៤" },
      {
        t: "ul",
        xs: [
          "ថតរូបម្ហូបរបស់អ្នកជាមួយទូរស័ព្ទ (ពន្លឺធម្មជាតិល្អបំផុត)",
          "បន្ថែមម្ហូប តម្លៃ និងប្រភេទ ទៅក្នុងប្រព័ន្ធ",
          "បង្កើត QR សម្រាប់តុរបស់អ្នក រួចបោះពុម្ពស្អិត",
          "ដាក់ QR លើតុ ហើយសាកល្បងបញ្ជាទិញជាមួយខ្លួនឯងជាមុន",
        ],
      },
      { t: "h", x: "ពេលរួចរាល់" },
      { t: "p", x: "អតិថិជនស្កេន QR មើលមីនុយ បញ្ជាទិញ ហើយអ្នកទទួលសារភ្លាមៗតាម Telegram ជាមួយលេខតុ និងបញ្ជីម្ហូប។" },
    ],
    content_en: [
      { t: "p", x: "Switching to QR menus sounds technical, but in practice it's simple enough for any owner to do in one afternoon." },
      { t: "h", x: "The 4 steps" },
      {
        t: "ul",
        xs: [
          "Photograph your dishes with your phone (natural light works best)",
          "Add dishes, prices, and categories to the system",
          "Generate a QR code for each table and print / stick it",
          "Place the QR on the table and place a test order yourself",
        ],
      },
      { t: "h", x: "When you're done" },
      { t: "p", x: "Guests scan, browse, order — and you instantly receive the order on Telegram with the table number and item list." },
    ],
  },
  {
    slug: "cut-order-mistakes",
    tag_km: "ប្រតិបត្តិការ",
    tag_en: "Operations",
    date: "2026-08-02",
    read_min: 3,
    image:
      "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/DSC_0039_pnh4pf.jpg",
    title_km: "បង្ការការកម្មង់ខុសជាមួយការបញ្ជាទិញដោយខ្លួនឯង",
    title_en: "Cut order mistakes with self-service ordering",
    excerpt_km:
      "ការកម្មង់ខុសចំណាយទាំងពេលវេលា ទាំងអាហារខ្ជះខ្ជាយ។ ការបញ្ជាទិញដោយខ្លួនឯងជួយឲ្យអតិថិជនជ្រើសរើសច្បាស់លាស់។",
    excerpt_en:
      "Wrong orders waste time and food. Self-service ordering lets guests pick exactly what they want — no verbal confusion, no handwritten notes.",
    content_km: [
      { t: "p", x: "នៅពេលអតិថិជនបញ្ជាទិញដោយមាត់ ឬបុគ្គលិកសរសេរកត់ត្រា ឱកាសនៃការកម្មង់ខុសតែងតែកើតមាន។" },
      { t: "h", x: "មូលហេតុដែលកម្មង់ខុស" },
      {
        t: "ul",
        xs: [
          "សំឡេងរំខានក្នុងហាង ធ្វើឲ្យឮមិនច្បាស់",
          "ការពន្យល់ពីអតិថិជនមិនច្បាស់លាស់",
          "ឈ្មោះម្ហូបស្រដៀងគ្នា ឬការសរសេរដោយដៃអានពិបាក",
        ],
      },
      { t: "h", x: "ដំណោះស្រាយ" },
      { t: "p", x: "ជាមួយមីនុយឌីជីថល អតិថិជនមើលរូបភាព តម្លៃ និងបរិមាណ រួចបញ្ជាក់បញ្ជាទិញដោយខ្លួនឯង។ គ្រប់ការបញ្ជាទិញទៅដល់ផ្ទះបាយដោយអត្ថបទច្បាស់លាស់។" },
    ],
    content_en: [
      { t: "p", x: "When guests order verbally and staff scribble notes, mistakes are almost guaranteed — especially during busy hours." },
      { t: "h", x: "Why orders go wrong" },
      {
        t: "ul",
        xs: [
          "Loud dining rooms make spoken orders easy to mishear",
          "Guests aren't always clear about what they want",
          "Similar dish names or messy handwriting cause confusion",
        ],
      },
      { t: "h", x: "The fix" },
      { t: "p", x: "With a digital menu, guests see photos, prices, and quantities, then confirm the order themselves. Every order reaches the kitchen as clear text — table number included." },
    ],
  },
];