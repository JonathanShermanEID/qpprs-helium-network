/**
 * Decoy Website Generator
 * Creates randomized decoy websites to mislead threats
 * Author: Jonathan Sherman - Monaco Edition
 */

export interface DecoyTemplate {
  type: "grocery" | "retail" | "blog" | "portfolio" | "restaurant" | "fitness";
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Generate random decoy website configuration
 */
export function generateRandomDecoy(): DecoyTemplate {
  const decoyTypes: DecoyTemplate[] = [
    {
      type: "grocery",
      name: "FreshMart Grocery",
      description: "Your neighborhood grocery store",
      theme: {
        primary: "#16a34a",
        secondary: "#059669",
        accent: "#10b981",
      },
    },
    {
      type: "retail",
      name: "Urban Fashion Outlet",
      description: "Latest trends in fashion",
      theme: {
        primary: "#7c3aed",
        secondary: "#6d28d9",
        accent: "#8b5cf6",
      },
    },
    {
      type: "blog",
      name: "Tech Insights Daily",
      description: "Technology news and reviews",
      theme: {
        primary: "#2563eb",
        secondary: "#1d4ed8",
        accent: "#3b82f6",
      },
    },
    {
      type: "portfolio",
      name: "Creative Studio Pro",
      description: "Design and development services",
      theme: {
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444",
      },
    },
    {
      type: "restaurant",
      name: "Bella Cucina Restaurant",
      description: "Authentic Italian cuisine",
      theme: {
        primary: "#ea580c",
        secondary: "#c2410c",
        accent: "#f97316",
      },
    },
    {
      type: "fitness",
      name: "PowerFit Gym",
      description: "Transform your body and mind",
      theme: {
        primary: "#0891b2",
        secondary: "#0e7490",
        accent: "#06b6d4",
      },
    },
  ];

  // Randomly select a decoy type
  const randomIndex = Math.floor(Math.random() * decoyTypes.length);
  return decoyTypes[randomIndex];
}

/**
 * Generate decoy content based on type
 */
export function generateDecoyContent(decoy: DecoyTemplate) {
  const contentMap = {
    grocery: {
      hero: "Fresh Deals This Week!",
      cta: "Shop Now",
      features: ["Organic Produce", "Fresh Bakery", "Quality Meats", "Dairy Products"],
      products: [
        { name: "Fresh Organic Apples", price: 3.99, emoji: "🍎" },
        { name: "Whole Wheat Bread", price: 2.49, emoji: "🍞" },
        { name: "Farm Fresh Eggs", price: 4.29, emoji: "🥚" },
        { name: "Organic Milk", price: 5.99, emoji: "🥛" },
      ],
    },
    retail: {
      hero: "New Collection Just Arrived!",
      cta: "Browse Collection",
      features: ["Latest Trends", "Quality Materials", "Fast Shipping", "Easy Returns"],
      products: [
        { name: "Designer Jacket", price: 129.99, emoji: "🧥" },
        { name: "Premium Sneakers", price: 89.99, emoji: "👟" },
        { name: "Leather Bag", price: 149.99, emoji: "👜" },
        { name: "Sunglasses", price: 59.99, emoji: "🕶️" },
      ],
    },
    blog: {
      hero: "Latest Tech News & Reviews",
      cta: "Read More",
      features: ["Daily Updates", "Expert Reviews", "Industry Insights", "How-To Guides"],
      products: [
        { name: "AI Revolution 2025", price: 0, emoji: "🤖" },
        { name: "Best Smartphones", price: 0, emoji: "📱" },
        { name: "Cloud Computing Guide", price: 0, emoji: "☁️" },
        { name: "Cybersecurity Tips", price: 0, emoji: "🔒" },
      ],
    },
    portfolio: {
      hero: "Bringing Your Vision to Life",
      cta: "View Portfolio",
      features: ["Web Design", "Mobile Apps", "Branding", "UI/UX Design"],
      products: [
        { name: "E-commerce Platform", price: 0, emoji: "🛒" },
        { name: "Mobile App Design", price: 0, emoji: "📱" },
        { name: "Brand Identity", price: 0, emoji: "🎨" },
        { name: "Website Redesign", price: 0, emoji: "💻" },
      ],
    },
    restaurant: {
      hero: "Authentic Italian Dining Experience",
      cta: "Reserve Table",
      features: ["Fresh Ingredients", "Traditional Recipes", "Wine Selection", "Cozy Atmosphere"],
      products: [
        { name: "Margherita Pizza", price: 16.99, emoji: "🍕" },
        { name: "Pasta Carbonara", price: 18.99, emoji: "🍝" },
        { name: "Tiramisu", price: 8.99, emoji: "🍰" },
        { name: "Italian Wine", price: 12.99, emoji: "🍷" },
      ],
    },
    fitness: {
      hero: "Transform Your Body & Mind",
      cta: "Join Now",
      features: ["Personal Training", "Group Classes", "Modern Equipment", "Nutrition Plans"],
      products: [
        { name: "Monthly Membership", price: 49.99, emoji: "💪" },
        { name: "Personal Training", price: 79.99, emoji: "🏋️" },
        { name: "Yoga Classes", price: 29.99, emoji: "🧘" },
        { name: "Nutrition Plan", price: 39.99, emoji: "🥗" },
      ],
    },
  };

  return contentMap[decoy.type];
}

/**
 * Log decoy deployment for analysis
 */
export async function logDecoyDeployment(
  decoy: DecoyTemplate,
  userAgent: string,
  ip: string,
  fingerprint: string
) {
  const logData = {
    timestamp: new Date().toISOString(),
    decoyType: decoy.type,
    decoyName: decoy.name,
    userAgent,
    ip,
    fingerprint,
  };

  console.log("[DECOY GENERATOR] Deployed decoy:", logData);

  // This data can be analyzed to identify patterns in unauthorized access attempts
  // and improve the cloaking system over time
}

/**
 * Generate decoy metadata for SEO misdirection
 */
export function generateDecoyMetadata(decoy: DecoyTemplate) {
  return {
    title: `${decoy.name} - ${decoy.description}`,
    description: `Welcome to ${decoy.name}. ${decoy.description}. Visit us today!`,
    keywords: `${decoy.type}, ${decoy.name}, local business, shopping, services`,
    author: "Business Owner",
    robots: "index, follow",
  };
}
