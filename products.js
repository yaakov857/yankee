// =====================================================================
//  המוצרים של YANKEE
//  כל מוצר הוא בלוק אחד בין { ו- }, ואחריו פסיק.
//
//  id           מק"ט. חייב להיות שונה בכל מוצר.
//  name         שם המוצר.
//  category     הקטגוריה. אחד מה-id שברשימת הקטגוריות למטה.
//  price        המחיר בשקלים. מספר בלבד, בלי ₪.
//  oldPrice     המחיר לפני ההנחה. אם אין הנחה: null
//  description  תיאור קצר.
//  weight       משקל בק"ג. אם לא יודעים: 0
//  images       רשימת תמונות מהתיקייה images, למשל ['images/kettle-1.jpg', 'images/kettle-2.jpg']
//               הראשונה היא התמונה הראשית. אם הרשימה ריקה [], מוצג איור.
//  icon         האיור כשאין תמונות. אפשר להשמיט.
//               אפשרויות: kettle pan towel lamp charger headphones speaker powerbank
//               bottle soap brush cream ball blocks mat dumbbell box
//
//  המוצרים כאן הם דוגמאות. מחליפים אותם במוצרים האמיתיים.
// =====================================================================

window.YANKEE_CATEGORIES = [
  { id: 'home',  name: 'בית ומטבח' },
  { id: 'tech',  name: 'אלקטרוניקה' },
  { id: 'care',  name: 'טיפוח' },
  { id: 'kids',  name: 'ילדים' },
  { id: 'sport', name: 'ספורט' }
];

window.YANKEE_PRODUCTS = [
  { id: 'H-1042', name: 'קומקום חשמלי 1.7 ליטר', category: 'home', price: 149, oldPrice: 189,
    description: 'נירוסטה, כיבוי אוטומטי, 2200W', weight: 1.2, images: [], icon: 'kettle' },

  { id: 'H-1077', name: 'מחבת נון-סטיק 28 ס"מ', category: 'home', price: 119, oldPrice: null,
    description: 'מתאימה לכל סוגי הכיריים כולל אינדוקציה', weight: 1.1, images: [], icon: 'pan' },

  { id: 'H-1103', name: 'סט 4 מגבות כותנה', category: 'home', price: 89, oldPrice: null,
    description: '100% כותנה, 500 גרם למ"ר, אפור פחם', weight: 1.6, images: [], icon: 'towel' },

  { id: 'H-1150', name: 'מנורת שולחן LED', category: 'home', price: 129, oldPrice: 159,
    description: '3 גווני אור, עמעום במגע', weight: 0.9, images: [], icon: 'lamp' },

  { id: 'T-2011', name: 'מטען מהיר USB-C 30W', category: 'tech', price: 69, oldPrice: null,
    description: 'תואם לרוב הטלפונים והטאבלטים', weight: 0.1, images: [], icon: 'charger' },

  { id: 'T-2034', name: 'אוזניות אלחוטיות', category: 'tech', price: 249, oldPrice: 299,
    description: 'סינון רעשים, עד 30 שעות סוללה', weight: 0.3, images: [], icon: 'headphones' },

  { id: 'T-2058', name: 'רמקול בלוטות׳ עמיד במים', category: 'tech', price: 179, oldPrice: null,
    description: 'IPX7, 12 שעות ניגון', weight: 0.6, images: [], icon: 'speaker' },

  { id: 'T-2090', name: 'סוללת גיבוי 20,000mAh', category: 'tech', price: 119, oldPrice: null,
    description: 'שתי יציאות, טעינה מהירה', weight: 0.4, images: [], icon: 'powerbank' },

  { id: 'C-3005', name: 'סבון ידיים טבעי 500 מ"ל', category: 'care', price: 24, oldPrice: null,
    description: 'שמן זית ולבנדר, ללא פרבנים', weight: 0.6, images: [], icon: 'soap' },

  { id: 'C-3021', name: 'מברשת שיניים חשמלית', category: 'care', price: 139, oldPrice: 169,
    description: '2 ראשים, טיימר של 2 דקות', weight: 0.4, images: [], icon: 'brush' },

  { id: 'C-3047', name: 'קרם לחות SPF30', category: 'care', price: 59, oldPrice: null,
    description: '50 מ"ל, לשימוש יומיומי', weight: 0.1, images: [], icon: 'cream' },

  { id: 'K-4012', name: 'ערכת קוביות בנייה 120 חלקים', category: 'kids', price: 99, oldPrice: null,
    description: 'מגיל 3, עץ מלא', weight: 1.4, images: [], icon: 'blocks' },

  { id: 'K-4030', name: 'כדור משחק רך', category: 'kids', price: 29, oldPrice: null,
    description: 'קוטר 20 ס"מ, בטוח לפעוטות', weight: 0.2, images: [], icon: 'ball' },

  { id: 'S-5008', name: 'מזרן יוגה 6 מ"מ', category: 'sport', price: 79, oldPrice: null,
    description: 'מונע החלקה, כולל רצועת נשיאה', weight: 1.0, images: [], icon: 'mat' },

  { id: 'S-5026', name: 'זוג משקולות 3 ק"ג', category: 'sport', price: 69, oldPrice: null,
    description: 'ציפוי ניאופרן', weight: 6.0, images: [], icon: 'dumbbell' },

  { id: 'S-5041', name: 'בקבוק תרמי 750 מ"ל', category: 'sport', price: 59, oldPrice: 79,
    description: 'שומר קר 24 שעות, חם 12 שעות', weight: 0.4, images: [], icon: 'bottle' }
];
