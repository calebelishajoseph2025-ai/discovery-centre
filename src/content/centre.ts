/**
 * Single source of truth for Northside Discovery Centre facts.
 * Conforms to §1.2 Fixed facts (must be identical everywhere).
 */

export interface LocalizedText {
  en: string;
  ta: string;
}

export interface CentreFacts {
  name: LocalizedText;
  tagline: LocalizedText;
  address: string; // Language-neutral token: "18 Garden Road, Riverdale"
  city: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  timezone: string; // "Asia/Kolkata"
  hours: {
    openTime: string; // "10:00"
    closeTime: string; // "17:00"
    openDays: string[]; // ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    closedDays: string[]; // ["Monday"]
    schedule: Record<
      string,
      { open: boolean; opens: string; closes: string; label: LocalizedText }
    >;
  };
  pricing: {
    adultINR: number; // 100
    childINR: number; // 50
    currency: string; // "INR"
    policy: LocalizedText;
  };
  accessibility: {
    claim: LocalizedText;
    summary: LocalizedText;
    stepFreeEntrance: boolean;
    wheelchairAccessible: boolean;
    accessibleRestrooms: boolean;
    seatingAvailable: boolean;
  };
  contact: {
    email: string; // "hello@northside-discovery.example"
    phonePlaceholder: string;
  };
}

export const CENTRE_FACTS: CentreFacts = {
  name: {
    en: 'Northside Discovery Centre',
    ta: 'Northside Discovery Centre',
  },
  tagline: {
    en: 'Hands-on science, curiosity, and interactive discovery for all ages.',
    ta: 'அனைத்து வயதினருக்குமான செய்முறை அறிவியல் மற்றும் ஊடாடும் ஆய்வுக்கூடம்.',
  },
  address: '18 Garden Road, Riverdale',
  city: 'Riverdale',
  postalCode: '600001', // fictional
  coordinates: {
    lat: 13.0827,
    lng: 80.2707,
  },
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=18+Garden+Road+Riverdale',
  timezone: 'Asia/Kolkata',
  hours: {
    openTime: '10:00',
    closeTime: '17:00',
    openDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    closedDays: ['Monday'],
    schedule: {
      Monday: {
        open: false,
        opens: '10:00',
        closes: '17:00',
        label: { en: 'Closed on Mondays', ta: 'திங்கட்கிழமைகளில் விடுமுறை' },
      },
      Tuesday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
      Wednesday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
      Thursday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
      Friday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
      Saturday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
      Sunday: {
        open: true,
        opens: '10:00',
        closes: '17:00',
        label: { en: '10:00 a.m. – 5:00 p.m.', ta: '10:00 மு.ப. – 5:00 பி.ப.' },
      },
    },
  },
  pricing: {
    adultINR: 100,
    childINR: 50,
    currency: 'INR',
    policy: {
      en: 'Pay at the reception desk via cash or UPI. Entry ticket covers all 5 exhibits.',
      ta: 'வரவேற்பு மேசையில் ரொக்கம் அல்லது UPI மூலம் செலுத்தவும். நுழைவுக் கட்டணம் 5 காட்சிகளுக்கும் பொருந்தும்.',
    },
  },
  accessibility: {
    claim: {
      en: 'Ground floor and main exhibits are wheelchair accessible',
      ta: 'தரைத்தளமும் முக்கிய காட்சிக்கூடங்களும் சக்கர நாற்காலி அணுகக்கூடியவை',
    },
    summary: {
      en: 'Level entrances, automatic front doors, step-free wide corridors throughout the entire facility, and dedicated quiet zones.',
      ta: 'சமதள நுழைவாயில்கள், தானியங்கி கதவுகள், படிக்கட்டுகளற்ற அகலமான நடைபாதைகள் மற்றும் அமைதியான பகுதிகள் உள்ளன.',
    },
    stepFreeEntrance: true,
    wheelchairAccessible: true,
    accessibleRestrooms: true,
    seatingAvailable: true,
  },
  contact: {
    email: 'hello@northside-discovery.example',
    phonePlaceholder: '+91 (044) 2000-0100', // fictional
  },
};
