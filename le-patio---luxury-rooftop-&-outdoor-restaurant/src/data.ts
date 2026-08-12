export interface BusinessDetails {
  name: string;
  type: string;
  tagline: string;
  cityArea: string;
  address: string;
  phone: string;
  whatsApp: string;
  mapsLink: string;
  openingHours: string;
  description: string;
  features: {
    accessibility: string[];
    serviceOptions: string[];
    highlights: string[];
    popularFor: string[];
    offerings: string[];
    diningOptions: string[];
    amenities: string[];
    atmosphere: string[];
    crowd: string[];
    planning: string[];
    payments: string[];
    children: string[];
    parking: string[];
  };
}

export const lePatioData: BusinessDetails = {
  name: "Le Patio",
  type: "Restaurant",
  tagline: "Rooftop Splendor & Cozy Outdoor Dining in Kathmandu",
  cityArea: "Mandikhatar Road, Kathmandu 44600",
  address: "Mandikhatar Road, Kathmandu 44600",
  phone: "9849488029",
  whatsApp: "9849488029",
  mapsLink: "https://maps.app.goo.gl/P8n1mymcH8ZMTKAP8",
  openingHours: "Daily: 11:00 AM - 10:30 PM",
  description: "Nestled in the quiet, scenic enclave of Mandikhatar Road, Le Patio is Kathmandu's premier luxury rooftop and outdoor restaurant. Under a canopy of warm fairy lights and panoramic views, we offer an elegant escape from the bustling city. Savor handcrafted cocktails, exceptional fine wines, and artisanal coffee paired with gourmet small plates and vegetarian-friendly offerings. With our live acoustic music, vibrant sports screenings, full wheelchair accessibility, and secure dedicated parking, we promise a welcoming, cosy, and romantic experience for family dinners, group celebrations, and quiet solo escapes.",
  features: {
    accessibility: ["Wheelchair-accessible toilet", "Accessible entrance", "Accessible seating"],
    serviceOptions: ["Outdoor seating", "Dine-in", "Takeaway", "Delivery"],
    highlights: ["Rooftop seating", "Live music", "Great cocktails", "Great beer selection", "Great wine list", "Great coffee", "Great dessert", "Great tea selection", "Sport screenings"],
    popularFor: ["Lunch", "Dinner", "Solo dining"],
    offerings: ["Craft Cocktails", "Fine Wine", "Spirits & Beer", "Vegetarian options", "All you can eat", "Coffee & Tea", "Happy-hour drinks", "Small plates", "Quick bite", "Private dining room"],
    diningOptions: ["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert", "Table service"],
    amenities: ["Bar on site", "Free Wi-Fi", "Clean facilities"],
    atmosphere: ["Casual", "Cosy", "Quiet", "Romantic", "Trendy"],
    crowd: ["Family friendly", "Groups welcome"],
    planning: ["Accepts reservations"],
    payments: ["Credit cards", "Debit cards", "NFC mobile payments"],
    children: ["Good for kids", "Good for kids birthdays", "High chairs available", "Kids' menu"],
    parking: ["Free of charge street parking", "Free parking lot", "Paid parking lot", "Plenty of parking"]
  }
};

// Curated mock food & drinks items representing Le Patio's real offerings (from their Highlights/Offerings)
export interface MenuItem {
  name: string;
  category: "cocktails" | "dishes" | "wine" | "dessert";
  description: string;
  price: string;
  tag?: string;
}

export const sampleMenu: MenuItem[] = [
  {
    name: "Patio Sunset Sangria",
    category: "cocktails",
    description: "Our signature blend of red wine, orange liqueur, fresh local Himalayan citrus, and seasonal spices.",
    price: "Rs. 750",
    tag: "Signature"
  },
  {
    name: "Mandikhatar Breeze",
    category: "cocktails",
    description: "Premium Nepalese vodka, elderflower syrup, freshly squeezed lime, and organic mint leaves, topped with club soda.",
    price: "Rs. 680",
    tag: "Popular"
  },
  {
    name: "Spiced Himalayan Old Fashioned",
    category: "cocktails",
    description: "Premium dark spirit infused with local mountain honey and homemade bitters, smoked with oak chips.",
    price: "Rs. 850"
  },
  {
    name: "Artisanal Cheese & Olive Platter",
    category: "dishes",
    description: "Curated selection of local yak cheeses and marinated Mediterranean olives, served with warm house bread.",
    price: "Rs. 950",
    tag: "Great for Sharing"
  },
  {
    name: "Himalayan Herbs Small Plates",
    category: "dishes",
    description: "Cosy, pan-seared vegetarian dumplings finished with local spices and wild tomato-coriander chutney.",
    price: "Rs. 480",
    tag: "Vegetarian"
  },
  {
    name: "Flame-Grilled Skewers",
    category: "dishes",
    description: "Tender grilled skewers marinated in mustard oil, wild garlic, and local spices, served with dynamic herb sauce.",
    price: "Rs. 720"
  },
  {
    name: "Imported Cabernet Sauvignon",
    category: "wine",
    description: "Rich, full-bodied red wine with deep dark fruit notes, beautifully pairing with our dinner selections.",
    price: "Rs. 1,100 / Glass"
  },
  {
    name: "Crisp Chardonnay Reserva",
    category: "wine",
    description: "Bright and vibrant white wine featuring notes of golden apple, honey, and a clean mineral finish.",
    price: "Rs. 980 / Glass"
  },
  {
    name: "Molten Chocolate Lava Sensation",
    category: "dessert",
    description: "Decadent dark chocolate fondant with a rich warm liquid center, served with artisanal vanilla bean gelato.",
    price: "Rs. 520",
    tag: "Must Try"
  },
  {
    name: "Himalayan Honey Tea cake",
    category: "dessert",
    description: "Lightly spiced, warm cardamom and honey-infused sponge cake, paired perfectly with our great selection of teas.",
    price: "Rs. 450"
  }
];

export const reassurancePoints = [
  {
    title: "Full Accessibility",
    description: "We are committed to true Nepalese hospitality. Our venue features a fully wheelchair-accessible entrance, accessible seating configurations, and wheelchair-accessible toilets."
  },
  {
    title: "Serene Rooftop & Garden Layout",
    description: "Elevate your dining with our beautifully manicured outdoor garden and open-air rooftop. Unmatched romantic views of Kathmandu’s hills, away from noise and dust."
  },
  {
    title: "Curated Beverages & Desserts",
    description: "From our celebrated beer selections, premium wines, and craft cocktails to single-origin espresso and award-winning desserts, every taste is curated for perfection."
  },
  {
    title: "Secure Parking & Conveniences",
    description: "Hassle-free visits with plenty of parking including free on-site lots, high-speed Wi-Fi, child-friendly high chairs, and seamless digital/NFC card payments."
  }
];

export const faqItems = [
  {
    question: "Do I need to make a reservation for rooftop dining?",
    answer: "While we welcome walk-ins, we highly recommend making a reservation, especially for weekend evenings, live music nights, and outdoor or rooftop seating. You can book directly using our website CTA."
  },
  {
    question: "Is Le Patio wheelchair accessible?",
    answer: "Yes, fully! Accessibility is one of our key features. We have a wheelchair-accessible entrance, accessible table configurations, and a fully equipped wheelchair-accessible toilet on site."
  },
  {
    question: "What parking arrangements do you have?",
    answer: "We offer plenty of parking options, including a dedicated free parking lot on-site, free street parking, and close proximity to paid lots for your complete convenience."
  },
  {
    question: "Is Le Patio child and family friendly?",
    answer: "Absolutely! We provide high chairs, kids' menus, and a spacious, safe outdoor area perfect for families and kid's birthday celebrations."
  },
  {
    question: "What days do you host live music?",
    answer: "We host acoustic live music acts on selected weekend nights and special holiday events. Follow our social media pages or contact us via WhatsApp to find out this week's lineup!"
  }
];

export interface ReviewItem {
  author: string;
  rating: number;
  highlight: string;
  title?: string;
  content: string;
  date: string;
}

export const guestReviews: ReviewItem[] = [
  {
    author: "Sashank Upadhaya",
    rating: 5,
    highlight: "Good food 😋 👌. Bit expensive but family kid friendly with best ambience.",
    title: "Le Patio: An Urban Oasis",
    content: "Dining at Le Patio is less of a meal and more of a quiet escape. Tucked away from the city bustle, this charming restaurant delivers an experience that is both sophisticated and deeply relaxing. The centerpiece, of course, is the lush, open-air courtyard—hence the name—where string lights cast a warm glow over intimate, closely spaced tables. It instantly transports you to a hidden corner of the Mediterranean.\n\nThe cuisine complements the setting perfectly. Le Patio specializes in refined French and Mediterranean dishes, executed with precision. While the menu changes seasonally, the house specialty, a Pan-Seared Halibut with Lemon-Caper Butter, is consistently outstanding. The fish is flaky, the sauce is bright, and the portioning is just right. The wine list is thoughtful, offering excellent pairings for every plate.\n\nService is attentive without being intrusive; our server was knowledgeable about the provenance of the ingredients and offered genuine recommendations. Though Le Patio is certainly on the pricier side, the impeccable ambiance, high-quality food, and excellent service make it a worthwhile destination for a special occasion or a delightful date night. It’s a truly memorable urban oasis.",
    date: "June 2026"
  },
  {
    author: "b Co.",
    rating: 5,
    highlight: "Warm Ambiance, Helpful Staff & Spectacular Views.",
    content: "The Experience was Good.\nThey have put in a lot of effort into making this place a good one.\nWarm Ambiance and Hospitality.\nThe Staffs were helpful and polite.\nThe location is ExtraOrdinary.\nThe Views from here are Spectacular.\nFood was tasty.\nEspecially the Chicken Roasted Kimchi.\nPizza was scrumptious with a thin crust.\nChicken Mo:Mo was okay.\nWe had a Good Time out there.\nI highly recommend the place.",
    date: "June 2026"
  }
];

