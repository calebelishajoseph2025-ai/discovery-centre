/**
 * Exhibits content definition.
 * 5 exhibits: Light Lab (30m), Build Bench (45m), Sky Room (25m),
 * Echo Tunnel (20m - fictional), Garden Trail (20m - fictional).
 * All exhibits are strictly ground floor / step-free accessible.
 */

import { LocalizedText } from './centre.ts';

export type ExhibitSlug =
  | 'light-lab'
  | 'build-bench'
  | 'sky-room'
  | 'echo-tunnel'
  | 'garden-trail';

export interface Exhibit {
  slug: ExhibitSlug;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  durationMinutes: number; // Light Lab: 30, Build Bench: 45, Sky Room: 25, Echo: 20, Garden: 20
  zone: string; // 'Zone A', 'Zone B', etc.
  floor: 'Ground floor'; // Strictly ground floor
  interests: string[]; // e.g. ['light', 'art', 'family']
  ageRange: LocalizedText;
  accessibility: LocalizedText;
  whatYoullDo: LocalizedText[];
  tips: LocalizedText[];
  accentToken: string; // CSS variable name or hex
  calm: boolean; // true ONLY for sky-room and garden-trail
  sensoryNote: LocalizedText;
  initialFavourites: number; // baseline fictional counter
}

export const EXHIBITS: Exhibit[] = [
  {
    slug: 'light-lab',
    name: {
      en: 'Light Lab',
      ta: 'Light Lab',
    },
    tagline: {
      en: 'Colour, prisms, and interactive shadow play',
      ta: 'வண்ணங்கள், முப்பட்டகங்கள் மற்றும் ஊடாடும் நிழல் விளையாட்டு',
    },
    description: {
      en: 'Explore the science of optics, beam splitting, and additive colour mixing on illuminated interactive tables and large shadow walls.',
      ta: 'ஒளியியல், நிறப்பிரிகை மற்றும் முப்பட்டகங்களை ஒளி அமைக்கப்பட்ட மேசைகளிலும் நிழல் சுவர்களிலும் பரிசோதித்துப் பாருங்கள்.',
    },
    durationMinutes: 30, // §1.2: exactly 30 minutes
    zone: 'Zone A',
    floor: 'Ground floor',
    interests: ['light', 'art', 'family'],
    ageRange: {
      en: 'Ages 4+',
      ta: 'வயது 4+',
    },
    accessibility: {
      en: 'Fully step-free; low-height optic tables accessible for wheelchair users.',
      ta: 'முழுமையான தரைத்தள வசதி; சக்கர நாற்காலியில் அமர்ந்தவாறே பயன்படுத்தக்கூடிய மேசைகள்.',
    },
    whatYoullDo: [
      {
        en: 'Mix primary beams of light on the giant phosphorescent wall',
        ta: 'ராட்சத ஒளிரும் சுவரில் முதன்மை ஒளிக்கற்றைகளைக் கலந்து புதிய வண்ணங்களை உருவாக்குங்கள்',
      },
      {
        en: 'Bend white light through high-precision glass prisms',
        ta: 'துல்லியமான முப்பட்டகங்கள் மூலம் வெள்ளை ஒளியை வானவில் நிறங்களாகப் பிரியுங்கள்',
      },
      {
        en: 'Capture your frozen multicoloured silhouette in the shadow theatre',
        ta: 'நிழல் அரங்கில் பல வண்ண நிழல் பிம்பங்களைப் படம் பிடியுங்கள்',
      },
    ],
    tips: [
      {
        en: 'Wear light or white clothing for the brightest shadow projections.',
        ta: 'பிரகாசமான நிழல் காட்சிகளுக்கு வெளிர் நிற உடைகளை அணியுங்கள்.',
      },
      {
        en: 'Best visited during morning hours when light contrast is crisp.',
        ta: 'காலை வேளையில் ஒளி வேறுபாடுகளைக் காண மிகவும் ஏற்றது.',
      },
    ],
    accentToken: 'lantern',
    calm: false,
    sensoryNote: {
      en: 'Lively atmosphere with dynamic coloured spotlights and projected patterns.',
      ta: 'வண்ணமயமான விளக்குகள் மற்றும் ஒளிரும் திரைகளுடன் கூடிய துடிப்பான சூழல்.',
    },
    initialFavourites: 142,
  },
  {
    slug: 'build-bench',
    name: {
      en: 'Build Bench',
      ta: 'Build Bench',
    },
    tagline: {
      en: 'Hands-on construction, kinetic gears, and gravity ramps',
      ta: 'கட்டுமானப் பொறிகள், சுழலும் பற்சக்கரங்கள் மற்றும் ஈர்ப்பு விசை சறுக்கல்கள்',
    },
    description: {
      en: 'Design, assemble, and test physical prototypes using magnetic building blocks, interlocking gear trains, and custom marble velocity tracks.',
      ta: 'காந்தக் கட்டைகள், பற்சக்கரங்கள் மற்றும் உருளைப் பாதைகளைக் கொண்டு சொந்தமாகப் பொறிகளை உருவாக்கிப் பரிசோதியுங்கள்.',
    },
    durationMinutes: 45, // §1.2: exactly 45 minutes
    zone: 'Zone B',
    floor: 'Ground floor',
    interests: ['building', 'hands-on', 'family'],
    ageRange: {
      en: 'Ages 5+',
      ta: 'வயது 5+',
    },
    accessibility: {
      en: 'Adjustable-height workbench stations with wide clear turning paths.',
      ta: 'உயரத்தை மாற்றியமைக்கக்கூடிய மேசைகள் மற்றும் அகலமான வழித்தடங்கள்.',
    },
    whatYoullDo: [
      {
        en: 'Construct earthquake-resistant towers on the motorized shake table',
        ta: 'அதிர்வு மேடையில் நிலநடுக்கத்தைத் தாங்கும் கோபுரங்களை வடிவமைத்துக் கட்டுங்கள்',
      },
      {
        en: 'Chain planetary gear systems to multiply rotational speed',
        ta: 'சுழற்சி வேகத்தைப் பெருக்க பற்சக்கரத் தொடர்களை இணைத்துப் பாருங்கள்',
      },
      {
        en: 'Race weighted marbles through custom multi-loop tracks',
        ta: 'சுழல் பாதைகளில் எடையுள்ள கோலிகளை உருட்டிப் பந்தயம் வையுங்கள்',
      },
    ],
    tips: [
      {
        en: 'Allow extra time here—visitors frequently stay longer than estimated!',
        ta: 'இங்கு சற்று கூடுதல் நேரம் ஒதுக்கலாம்—பார்வையாளர்கள் அதிக நேரம் செலவிட விரும்புவார்கள்!',
      },
      {
        en: 'Friendly facilitators are on hand to suggest structural engineering challenges.',
        ta: 'உதவியாளர்கள் புதிய கட்டமைப்புச் சவால்களை வழிகாட்டத் தயாராக உள்ளனர்.',
      },
    ],
    accentToken: 'ember',
    calm: false,
    sensoryNote: {
      en: 'Energetic environment with audible clicks, rolling spheres, and cheerful chatter.',
      ta: 'பற்சக்கர ஒலிகள் மற்றும் உரையாடல்களுடன் உற்சாகமான செய்முறைப் பகுதி.',
    },
    initialFavourites: 189,
  },
  {
    slug: 'sky-room',
    name: {
      en: 'Sky Room',
      ta: 'Sky Room',
    },
    tagline: {
      en: 'Introduces the night sky under an immersive acoustic dome',
      ta: 'அமைதியான குவிமாடத்தின் கீழ் இரவு வானத்தின் விண்மீன் அறிமுகம்',
    },
    description: {
      en: 'Step into a tranquil seated planetarium dome introducing celestial constellations, planets, and deep-space nebulae through soothing narration and gentle projections.',
      ta: 'சாய்வு இருக்கைகளுடன் கூடிய குவிமாடத்தில் விண்மீன்கள், கோள்கள் மற்றும் பேரண்டத்தின் அழகை அமைதியான விளக்க உரையுடன் கண்டு ரசியுங்கள்.',
    },
    durationMinutes: 25, // §1.2: exactly 25 minutes
    zone: 'Zone C',
    floor: 'Ground floor',
    interests: ['space', 'calm'],
    ageRange: {
      en: 'All ages',
      ta: 'அனைத்து வயதினருக்கும்',
    },
    accessibility: {
      en: 'Ground-level entrance with dedicated wheelchair bays and ergonomic reclined seating.',
      ta: 'சக்கர நாற்காலிகளுக்கான சிறப்பு இடவசதி மற்றும் சாய்வு இருக்கைகள்.',
    },
    whatYoullDo: [
      {
        en: 'Watch constellation figures trace across the night sky dome every 15 minutes',
        ta: 'ஒவ்வொரு 15 நிமிடங்களுக்கும் திரையிடப்படும் விண்மீன் மண்டலக் காட்சியை ரசியுங்கள்',
      },
      {
        en: 'Identify the pole star and seasonal zodiac markers visible from Riverdale',
        ta: 'துருவ நட்சத்திரம் மற்றும் பருவகால ராசி விண்மீன்களை அடையாளம் காணக் கற்றுக்கொள்ளுங்கள்',
      },
      {
        en: 'Experience a relaxing ambient cosmic soundscape with gentle acoustic resonance',
        ta: 'அமைதியான விண்வெளி இசையமைப்பில் மனதை இளைப்பாறுங்கள்',
      },
    ],
    tips: [
      {
        en: 'Shows repeat continuously every 15 minutes—enter between show cycles.',
        ta: 'நிகழ்ச்சிகள் 15 நிமிடங்களுக்கு ஒருமுறை தொடங்குகின்றன—இடைவேளையில் உள்ளே செல்லலாம்.',
      },
      {
        en: 'An ideal retreat if feeling overstimulated by the louder exhibits.',
        ta: 'அதிக சத்தமில்லாத, மன அமைதி தரும் ஒரு சிறந்த அமைதி மண்டலம்.',
      },
    ],
    accentToken: 'dusk-rose',
    calm: true, // §1.2: calm room
    sensoryNote: {
      en: 'Gentle, darkened ambient space with soft lighting and calm seated audio.',
      ta: 'மிதமான வெளிச்சம், அமைதியான ஒலி மற்றும் வசதியான இருக்கைகள் கொண்ட பகுதி.',
    },
    initialFavourites: 231,
  },
  {
    slug: 'echo-tunnel',
    name: {
      en: 'Echo Tunnel',
      ta: 'Echo Tunnel',
    },
    tagline: {
      en: 'Vibrations, standing sound waves, and acoustic resonance',
      ta: 'ஒலி அதிர்வுகள், நிலையான அலைகள் மற்றும் ஒலியியல் அதிர்வுக்கூடம்',
    },
    description: {
      en: 'Walk through an acoustic chamber exploring harmonic frequency tubes, chime resonators, and tactile bass transducers you can feel through your palms.',
      ta: 'ஒலி அலைகள் காற்றில் பரவுவதையும், அதிர்வுகள் பொருள்களை அசைப்பதையும் நேரடியாக உணர்ந்து பார்க்கும் ஒலிப் பாதை.',
    },
    durationMinutes: 20, // fictional
    zone: 'Zone D',
    floor: 'Ground floor',
    interests: ['sound', 'hands-on'],
    ageRange: {
      en: 'Ages 6+',
      ta: 'வயது 6+',
    },
    accessibility: {
      en: 'Wide level passage with sensory-safe bypass door and visual frequency visualizers.',
      ta: 'அகலமான சமதள நடைபாதை, மாற்று வெளிச்செல்லும் வழி மற்றும் ஒலியை ஒளியாகக் காட்டும் திரைகள்.',
    },
    whatYoullDo: [
      {
        en: 'Trigger sonic resonance patterns in giant singing quartz bowls',
        ta: 'பெரிய குவார்ட்ஸ் கிண்ணங்களில் அதிர்வு அலைகளைத் தூண்டி இசையை உருவாக்குங்கள்',
      },
      {
        en: 'Watch dry sand dance into intricate Chladni geometric patterns',
        ta: 'கிளாட்னி உலோகத் தட்டுகளில் ஒலி அதிர்வினால் மணல் வடிவியல் கோலங்களை அமைப்பதைப் பாருங்கள்',
      },
      {
        en: 'Whisper across the curved elliptical parabola to a friend 12 metres away',
        ta: '12 மீட்டர் தொலைவில் உள்ள நண்பருக்கு மெல்லிய முணுமுணுப்பைத் தெளிவாகக் கடத்துங்கள்',
      },
    ],
    tips: [
      {
        en: 'Complimentary noise-dampening ear defenders are available at the entrance.',
        ta: 'சத்தத்தைத் தணிக்கும் காது கவசங்கள் நுழைவாயிலில் இலவசமாகக் கிடைக்கும்.',
      },
      {
        en: 'Quiet Visit mode suggests taking the calming Garden Trail directly after.',
        ta: 'அமைதி விரும்பிகள் இதற்குப் பின் பூந்தோட்டப் பாதைக்குச் செல்வது நல்லது.',
      },
    ],
    accentToken: 'verdigris',
    calm: false,
    sensoryNote: {
      en: 'Loudest exhibit on site: features acoustic chimes, resonant tones, and physical vibrations.',
      ta: 'மையத்தின் அதிக சத்தமுள்ள பகுதி: மணியோசைகள் மற்றும் உடல் ரீதியான ஒலி அதிர்வுகள் இருக்கும்.',
    },
    initialFavourites: 98,
  },
  {
    slug: 'garden-trail',
    name: {
      en: 'Garden Trail',
      ta: 'Garden Trail',
    },
    tagline: {
      en: 'Paved outdoor loop with mini weather stations and local biodiversity',
      ta: 'மழைமானி, காற்றுத் திசைகாட்டி மற்றும் இயற்கை சார்ந்த வெளிப்புற நடைபாதை',
    },
    description: {
      en: 'A serene paved outdoor courtyard trail featuring solar shadow dials, an anemometer wind station, native pollinator plants, and quiet shaded benches.',
      ta: 'சூரிய நிழல் கடிகாரம், காற்று வேகமானி மற்றும் உள்நாட்டுத் தாவரங்கள் நிறைந்த பசுமையான திறந்தவெளி நடைபாதை.',
    },
    durationMinutes: 20, // fictional
    zone: 'Zone E',
    floor: 'Ground floor',
    interests: ['nature', 'calm', 'family'],
    ageRange: {
      en: 'All ages',
      ta: 'அனைத்து வயதினருக்கும்',
    },
    accessibility: {
      en: 'Fully paved 1.8-metre wide pathway with gentle gradients and frequent shaded seating.',
      ta: 'முழுமையாகத் தளம் அமைக்கப்பட்ட 1.8 மீ அகல பாதை, சாய்வுத்தளங்கள் மற்றும் நிழல் இருக்கைகள்.',
    },
    whatYoullDo: [
      {
        en: 'Read local Riverdale wind velocity and barometric pressure at the mini weather post',
        ta: 'சிறிய வானிலை நிலையத்தில் காற்றின் வேகம் மற்றும் அழுத்தத்தை அளவிடுங்கள்',
      },
      {
        en: 'Check the real solar time on the brass equinoctial sundial',
        ta: 'பித்தளை சூரியக் கடிகாரத்தில் துல்லியமான சூரிய நேரத்தைக் கணக்கிடுங்கள்',
      },
      {
        en: 'Discover native aromatic plants identified with braille and high-contrast signage',
        ta: 'பிரெய்லி மற்றும் தெளிவான பலகைகளுடன் கூடிய நறுமணத் தாவரங்களை உணருங்கள்',
      },
    ],
    tips: [
      {
        en: 'Paved and smooth; accessible during light rain with complimentary umbrellas.',
        ta: 'மென்மையான தரைத்தளம்; மிதமான மழையிலும் பயன்படுத்த குடைகள் உண்டு.',
      },
      {
        en: 'A lovely place for a quiet breather before heading home.',
        ta: 'பார்வையை முடித்துத் திரும்புவதற்கு முன் அமைதியாக ஓய்வெடுக்கச் சிறந்த இடம்.',
      },
    ],
    accentToken: 'moss',
    calm: true, // §1.2: calm room
    sensoryNote: {
      en: 'Natural daylight, gentle birdsong, open fresh air, and peaceful shaded rest points.',
      ta: 'இயற்கை வெளிச்சம், தென்றல் காற்று மற்றும் நிழலான அமைதியான சூழல்.',
    },
    initialFavourites: 165,
  },
];
