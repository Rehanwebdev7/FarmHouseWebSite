// Boss Farm House System Constants
// Strictly typed configuration

export interface EstateCoordinates {
  lat: number;
  lng: number;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  googleMapsLink: string;
}

export interface EstateContact {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
}

export interface Amenity {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface HygieneParameter {
  name: string;
  value: string;
  status: "optimal" | "warning" | "critical";
  lastTested: string;
  description: string;
}

export interface SystemTheme {
  primaryColor: string; // Brushed Gold
  secondaryColor: string; // Azure Pool
  bgMidnight: string; // Midnight Obsidian
}

export const ESTATE_COORDINATES: EstateCoordinates = {
  lat: 20.86741668214945,
  lng: 74.79521450793962,
  addressLine1: "Zikra Park, behind Hotel 5555",
  addressLine2: "near Dhule - Chalisgaon Road, Pimpri, Choufully",
  landmark: "Behind Hotel 5555",
  city: "Dhule, Maharashtra",
  state: "424001",
  googleMapsLink: "https://maps.google.com/?q=20.86741668214945,74.79521450793962",
};

export const ESTATE_CONTACT: EstateContact = {
  phone: "+919371113786",
  phoneDisplay: "093711 13786",
  whatsapp: "919371113786",
  whatsappDisplay: "093711 13786",
  email: "bookings@bossfarmhouse.com",
};

export const ESTATE_AMENITIES: Amenity[] = [
  {
    id: "private-pool",
    title: "Sanctuary Pool",
    description: "Dhule's first completely private, chemical-balanced deep pool featuring premium night lighting.",
    iconName: "Waves",
  },
  {
    id: "tropical-lawn",
    title: "Tropical Lawns",
    description: "Expansive landscape manicured to perfection, ideal for bespoke family events and complete tranquility.",
    iconName: "Trees",
  },
  {
    id: "open-lounge",
    title: "The Oasis Lounge",
    description: "Open-concept private terrace layout overlooking the pool, detailed with bespoke timber fittings.",
    iconName: "Sofa",
  },
  {
    id: "family-privacy",
    title: "Uncompromising Privacy",
    description: "High perimeter obsidian security walls guaranteeing absolute exclusivity. No overlapping guest bookings.",
    iconName: "ShieldCheck",
  },
];

export const POOL_HYGIENE_LOGS: HygieneParameter[] = [
  {
    name: "pH Level",
    value: "7.4",
    status: "optimal",
    lastTested: "Updated 2 hours ago",
    description: "Perfect range (7.2 - 7.6) ensures complete skin and eye comfort.",
  },
  {
    name: "Chlorination",
    value: "2.1 ppm",
    status: "optimal",
    lastTested: "Updated 2 hours ago",
    description: "Maintains absolute sterility against organic impurities.",
  },
  {
    name: "Filtration",
    value: "Active",
    status: "optimal",
    lastTested: "Continuous flow",
    description: "Dual-bed silica filtration running through multi-port valve schedules.",
  },
  {
    name: "Water Temp",
    value: "26°C",
    status: "optimal",
    lastTested: "Updated 1 hour ago",
    description: "Perfect thermal balance for luxury night swimming.",
  },
];

export const SYSTEM_THEME: SystemTheme = {
  primaryColor: "#D4AF37", // Gold
  secondaryColor: "#007A87", // Azure
  bgMidnight: "#0D0D0D", // Midnight Onyx
};

export const APP_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ADMIN_SUPPORT: "admin-support",
  USER: "user",
} as const;

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];
