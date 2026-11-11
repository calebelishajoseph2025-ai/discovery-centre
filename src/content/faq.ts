/**
 * FAQ content for Northside Discovery Centre.
 * At least 8 questions covering practical visit details, tickets, accessibility, etc.
 * Localized in English and Tamil.
 */

import { LocalizedText } from './centre.ts';

export interface FAQItem {
  id: string;
  category: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export const FAQS: FAQItem[] = [
  {
    id: 'days-hours',
    category: 'Hours & Location',
    question: {
      en: 'What days and hours is Northside Discovery Centre open?',
      ta: 'மையம் எந்த நாட்களில் மற்றும் எந்த நேரங்களில் திறந்திருக்கும்?',
    },
    answer: {
      en: 'We are open Tuesday to Sunday from 10:00 a.m. to 5:00 p.m. We are closed on Mondays for exhibit maintenance and deep cleaning.',
      ta: 'நாங்கள் செவ்வாய் முதல் ஞாயிறு வரை காலை 10:00 மணி முதல் மாலை 5:00 மணி வரை திறந்திருக்கிறோம். திங்கட்கிழமைகளில் பராமரிப்புப் பணிகளுக்காக விடுமுறை.',
    },
  },
  {
    id: 'ticket-prices',
    category: 'Tickets',
    question: {
      en: 'How much are tickets, and do I need to book in advance?',
      ta: 'நுழைவுக்கட்டணம் எவ்வளவு, முன்கூட்டியே முன்பதிவு செய்ய வேண்டுமா?',
    },
    answer: {
      en: 'Admission is INR 100 for adults and INR 50 for children. There is no mandatory advance booking—you can purchase your tickets at the reception desk upon arrival via cash or UPI.',
      ta: 'நுழைவுக் கட்டணம் பெரியவர்களுக்கு INR 100 மற்றும் குழந்தைகளுக்கு INR 50. முன்கூட்டியே பதிவு செய்ய வேண்டிய அவசியமில்லை—வந்தவுடன் வரவேற்பு மேசையில் ரொக்கம் அல்லது UPI மூலம் டிக்கெட் பெறலாம்.',
    },
  },
  {
    id: 'visit-duration',
    category: 'Planning',
    question: {
      en: 'How long should we plan for our visit?',
      ta: 'எங்கள் வருகைக்கு எவ்வளவு நேரம் ஒதுக்க வேண்டும்?',
    },
    answer: {
      en: 'Most visitors spend between 60 and 120 minutes exploring. Our interactive Visit Planner lets you generate an optimized itinerary for visits as short as 20 minutes up to 3+ hours.',
      ta: 'பெரும்பாலான பார்வையாளர்கள் 60 முதல் 120 நிமிடங்கள் வரை செலவிடுகிறார்கள். எங்கள் வருகைத் திட்டமிடல் கருவி மூலம் 20 நிமிடங்கள் முதல் 3 மணி நேரம் வரை உங்கள் பயணத்திட்டத்தை எளிதாக உருவாக்கலாம்.',
    },
  },
  {
    id: 'accessibility-wheelchair',
    category: 'Accessibility',
    question: {
      en: 'Is the Discovery Centre wheelchair accessible?',
      ta: 'மையம் சக்கர நாற்காலி அணுகக்கூடியதா?',
    },
    answer: {
      en: 'Yes! The ground floor and main exhibits are wheelchair accessible. All five interactive zones, including the outdoor Garden Trail and Sky Room planetarium, are completely step-free with level thresholds and accessible restrooms.',
      ta: 'ஆம்! தரைத்தளமும் முக்கிய காட்சிக்கூடங்களும் சக்கர நாற்காலி அணுகக்கூடியவை. பூந்தோட்டம் மற்றும் ஸ்கை ரூம் உட்பட 5 காட்சிகளும் படிக்கட்டுகளற்ற சமதள வழித்தடங்களைக் கொண்டுள்ளன.',
    },
  },
  {
    id: 'strollers-prams',
    category: 'Families',
    question: {
      en: 'Can we bring strollers or prams inside?',
      ta: 'குழந்தைகள் தள்ளுவண்டியை (stroller) உள்ளே கொண்டு வரலாமா?',
    },
    answer: {
      en: 'Yes, strollers and prams are welcome throughout the ground floor. A dedicated pram parking bay is also available in the entrance lobby if you prefer to explore on foot.',
      ta: 'ஆம், தரைத்தளம் முழுவதும் குழந்தைகள் தள்ளுவண்டியைப் பயன்படுத்தலாம். தேவைப்பட்டால் வரவேற்பறையில் உள்ள சிறப்பு வாகன நிறுத்தப் பகுதியிலும் நிறுத்தி வைக்கலாம்.',
    },
  },
  {
    id: 'food-and-drink',
    category: 'Facilities',
    question: {
      en: 'Is outside food and drink allowed?',
      ta: 'வெளியிலிருந்து உணவு மற்றும் குடிநீர் கொண்டு வரலாமா?',
    },
    answer: {
      en: 'Personal water bottles with spill-proof lids are permitted in all areas. Outside food is not allowed inside the indoor exhibit galleries, but you are welcome to enjoy snacks on the shaded picnic tables along the Garden Trail.',
      ta: 'பாதுகாப்பான தண்ணீர் பாட்டில்கள் அனுமதிக்கப்படுகின்றன. உள்ளரங்கக் காட்சிக்கூடங்களுக்குள் உணவு அனுமதிக்கப்படுவதில்லை; ஆனால் பூந்தோட்டப் பாதையில் உள்ள நிழல் மேசைகளில் சிற்றுண்டிகளை உண்ணலாம்.',
    },
  },
  {
    id: 'photography',
    category: 'General',
    question: {
      en: 'Are photos and videos permitted?',
      ta: 'புகைப்படம் மற்றும் காணொளி எடுக்க அனுமதி உண்டா?',
    },
    answer: {
      en: 'Personal, non-commercial photography is encouraged! Flash photography is not permitted inside the Sky Room planetarium show to protect night-sky adaptation for all visitors.',
      ta: 'தனிப்பட்ட பயன்பாட்டிற்கான புகைப்படங்கள் எடுக்கலாம்! ஸ்கை ரூம் குவிமாடக் காட்சியின் போது மற்றவர்களின் பார்வையை பாதிக்காதிருக்க மின்னொளி (flash) தடை செய்யப்பட்டுள்ளது.',
    },
  },
  {
    id: 'rainy-weather',
    category: 'Planning',
    question: {
      en: 'What if it rains during our visit?',
      ta: 'நாங்கள் வரும் போது மழை பெய்தால் என்ன செய்வது?',
    },
    answer: {
      en: 'Four of our five exhibits (Light Lab, Build Bench, Sky Room, and Echo Tunnel) are entirely indoors and fully climate-controlled. The Garden Trail has a covered veranda and paved paths with complimentary umbrellas available.',
      ta: 'எங்கள் 5 காட்சிகளில் 4 (Light Lab, Build Bench, Sky Room, Echo Tunnel) முழுவதும் உள்ளரங்குகளில் குளிரூட்டப்பட்டு அமைந்துள்ளன. பூந்தோட்டப் பகுதிக்கு இலவச குடைகள் வழங்கப்படும்.',
    },
  },
  {
    id: 'quiet-hours',
    category: 'Sensory & Accessibility',
    question: {
      en: 'What is Quiet Visit Mode, and when are the quietest times to visit?',
      ta: 'அமைதியான வருகை முறை (Quiet Visit Mode) என்றால் என்ன, எப்போது கூட்டம் குறைவாக இருக்கும்?',
    },
    answer: {
      en: 'Tuesday and Wednesday mornings between 10:00 a.m. and 12:00 noon are the calmest hours. Switching on Quiet Visit Mode on this website prioritises calm exhibits (Sky Room, Garden Trail), reduces visual animations, and highlights quieter times.',
      ta: 'செவ்வாய் மற்றும் புதன் காலை 10:00 மணி முதல் 12:00 மணி வரை மிகவும் அமைதியான நேரம். அமைதி முறை தேர்வை ஆன் செய்தால், அமைதியான இடங்களை முன்னிலைப்படுத்தி அமைதியான திட்டத்தை உருவாக்கும்.',
    },
  },
];
