# Tamil Language Review & Translation Audit

> **Notice to Reviewers:** The Tamil translations across this application (`src/i18n/dictionaries/ta.ts` and `src/content/**`) were **machine-drafted** for the CSI VIT recruitment demonstration. Before launching in a production environment, all Tamil copy must be audited and revised by a fluent native Tamil speaker. The automated test suite (`pnpm check:i18n`) verifies key parity, `{param}` matching, and byte-identical fact retention, but linguistic fluency requires human judgment. All items below are strictly marked `reviewed: false`.

---

## Translation Key Audit Table

| Key | English Baseline | Machine-Drafted Tamil | Reviewed by Native Speaker? |
|---|---|---|---|
| `hero.title` | Plan a first visit you'll actually enjoy. | நீங்கள் முழுமையாக மகிழும் முதல் வருகையைத் திட்டமிடுங்கள். | ❌ false |
| `hero.subtitle` | Northside Discovery Centre — hands-on science, open Tuesday to Sunday. | Northside Discovery Centre — செய்முறை அறிவியல், செவ்வாய் முதல் ஞாயிறு வரை திறந்திருக்கும். | ❌ false |
| `journey.title` | Three Simple Steps to Explore | ஆராய்வதற்கான மூன்று எளிய படிகள் | ❌ false |
| `exhibits.title` | Explore Five Hands-on Zones | ஐந்து செய்முறை அறிவியல் மண்டலங்கள் | ❌ false |
| `planner.title` | Generate Your Personal Visit Plan | உங்கள் தனிப்பயன் வருகைத் திட்டத்தை உருவாக்குங்கள் | ❌ false |
| `explainer.title` | Why this plan? | இந்தத் திட்டம் ஏன்? | ❌ false |
| `bestTime.title` | Best Times to Visit | வருகைக்கான சிறந்த நேரங்கள் | ❌ false |
| `visit.title` | Essential Visitor Information | முக்கிய பார்வையாளர் விவரங்கள் | ❌ false |
| `feedback.question` | Was this plan useful? | இந்தத் திட்டம் பயனுள்ளதாக இருந்ததா? | ❌ false |
| `accessibility.claim` | Ground floor and main exhibits are wheelchair accessible | தரைத்தளமும் முக்கிய காட்சிக்கூடங்களும் சக்கர நாற்காலி அணுகக்கூடியவை | ❌ false |
| `hero.titleLead` | Plan a first visit you’ll actually | நீங்கள் முழுமையாக | ❌ false |
| `hero.titleEm` | enjoy | மகிழும் | ❌ false |
| `socialProof.kofn` | {k} of {n} visitors found their visit plan useful | {k} / {n} பார்வையாளர்கள் தங்கள் வருகைத் திட்டம் பயனுள்ளதாக இருந்ததாகக் கூறினர் | ❌ false |
| `prefs.title` | Visit preferences | வருகை விருப்பங்கள் | ❌ false |
| `offline.title` | Offline plans | ஆஃப்லைன் திட்டங்கள் | ❌ false |

---

## Language-Neutral Fact Invariant Assertion
The following facts are invariant language-neutral tokens and must render identical byte-for-byte in both English and Tamil:
- Address: `18 Garden Road, Riverdale`
- Ticket Adult: `INR 100`
- Ticket Child: `INR 50`
- Hours: `10:00` to `17:00`
- Exhibit Durations: `30 min`, `45 min`, `25 min`, `20 min`, `20 min`
