/**
 * Visitor journey stages (Arriving -> Exploring -> Deciding).
 * Constraints:
 * - Exactly 3 stages
 * - Copy <= 40 words each
 * - Guide line <= 12 words each
 * - Localized in English and Tamil
 */

import { LocalizedText } from './centre.ts';

export interface JourneyStage {
  id: 'arriving' | 'exploring' | 'deciding';
  stepNumber: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  guideLine: LocalizedText;
  targetAnchor: string;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'arriving',
    stepNumber: 1,
    title: {
      en: 'Arriving',
      ta: 'வருகை',
    },
    subtitle: {
      en: 'Step-free entrance at 18 Garden Road',
      ta: '18 கார்டன் சாலையில் படிக்கட்டுகளற்ற நுழைவு',
    },
    description: {
      en: 'Reach 18 Garden Road, Riverdale with ease. Enjoy ground-floor step-free access, secure bag lockers, accessible restrooms, and friendly front-desk guides ready to welcome you.',
      ta: '18 கார்டன் சாலைக்கு எளிதாக வாருங்கள். தரைத்தள நுழைவு, உடைமை வைப்பறை, கழிப்பறைகள் மற்றும் உதவும் வழிகாட்டிகள் உள்ளன.',
    },
    guideLine: {
      en: "Welcome! Step inside—we're excited to explore with you!",
      ta: 'நல்வரவு! உள்ளே வாருங்கள்—ஒன்றாக ஆராய்வோம்!',
    },
    targetAnchor: '#visit',
  },
  {
    id: 'exploring',
    stepNumber: 2,
    title: {
      en: 'Exploring',
      ta: 'ஆராய்ச்சி',
    },
    subtitle: {
      en: 'Five hands-on science galleries',
      ta: 'ஐந்து செய்முறை அறிவியல் கூடங்கள்',
    },
    description: {
      en: 'Immerse your curiosity across five hands-on galleries. Mix beams in Light Lab, engineer gear towers at Build Bench, and gaze into the cosmos inside Sky Room.',
      ta: 'ஐந்து காட்சிக்கூடங்களை ஆராயுங்கள். Light Lab-ல் வண்ணங்கள், Build Bench-ல் பற்சக்கரங்கள் மற்றும் Sky Room-ல் விண்மீன்களைப் பாருங்கள்.',
    },
    guideLine: {
      en: 'Try every hands-on lever, prism, and puzzle!',
      ta: 'ஒவ்வொரு செய்முறைப் பகுதியையும் தொட்டுப் பாருங்கள்!',
    },
    targetAnchor: '#exhibits',
  },
  {
    id: 'deciding',
    stepNumber: 3,
    title: {
      en: 'Deciding',
      ta: 'திட்டமிடல்',
    },
    subtitle: {
      en: 'Custom visit plans for your available time',
      ta: 'உங்களுக்கான தனிப்பயன் வருகைத் திட்டம்',
    },
    description: {
      en: 'Personalise what comes next. Tailor a visit schedule in our Planner, unwind along the tranquil Garden Trail, or grab a quiet breather before heading home.',
      ta: 'உங்கள் நேரத்திற்கு ஏற்ப திட்டமிடுங்கள். திட்டக் கருவியைப் பயன்படுத்துங்கள் அல்லது அமைதியான பூந்தோட்டத்தில் ஓய்வெடுங்கள்.',
    },
    guideLine: {
      en: 'Build your custom plan and have fun!',
      ta: 'உங்களுக்கான திட்டத்தை உடனே உருவாக்குங்கள்!',
    },
    targetAnchor: '#planner',
  },
];
