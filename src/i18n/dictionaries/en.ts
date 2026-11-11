/**
 * English dictionary for Northside Discovery Centre.
 * Fixed facts: 18 Garden Road, Riverdale · INR 100 · INR 50 · 10:00 · 17:00 · 30 / 45 / 25
 */

export const en = {
  // Navigation & Header
  'nav.skip': 'Skip to main content',
  'nav.exhibits': 'Exhibits',
  'nav.planner': 'Plan Visit',
  'nav.visit': 'Hours & Tickets',
  'nav.quality': 'Quality',
  'nav.theme': 'Toggle Theme',
  'nav.quiet': 'Quiet Mode',
  'nav.guide': 'Guide',
  'nav.guide.offQuiet': 'Off in quiet mode',
  'nav.language': 'Language',
  'nav.menu': 'Navigation Menu',
  'nav.close': 'Close Menu',
  'nav.openNow': 'Open Now',
  'nav.closed': 'Closed',
  'nav.myPlans': 'My Saved Plans',
  'nav.preferences': 'Preferences',
  'nav.home': 'Home',

  // Hero
  'hero.title': "Plan a first visit you'll actually enjoy.",
  'hero.titleLead': 'Plan a first visit you’ll actually',
  'hero.titleEm': 'enjoy',
  'hero.subtitle':
    'Northside Discovery Centre — hands-on science, open Tuesday to Sunday.',
  'hero.overline': 'Observatory · 18 Garden Road, Riverdale',
  'hero.cta.plan': 'Plan my visit',
  'hero.cta.exhibits': 'See exhibits',
  'hero.facts.address': '18 Garden Road, Riverdale',
  'hero.facts.hours': 'Tue–Sun, 10:00–17:00',
  'hero.facts.tickets': 'INR 100 adult / INR 50 child',
  'hero.facts.accessibility': 'Step-free main exhibits',
  'hero.ticket.title': 'Visitor pass',
  'hero.ticket.hours': '10:00–17:00',
  'hero.scroll': 'Descend into the galleries',
  'hero.starfield': 'Night sky over the Discovery Centre',
  'hero.pip': 'The dome is already lit.',

  // Journey
  'journey.badge': 'Visitor Journey',
  'journey.title': 'Three Simple Steps to Explore',
  'journey.subtitle':
    'From arrival at 18 Garden Road to tailoring your activities, here is how your visit unfolds.',
  'journey.continue': 'Continue',

  // Exhibits
  'exhibits.badge': 'Interactive Galleries',
  'exhibits.title': 'Explore Five Hands-on Zones',
  'exhibits.subtitle':
    'Step-free ground-floor access across all science galleries. Filter by interest to get started.',
  'exhibits.filter.all': 'All Interests',
  'exhibits.filter.light': 'Light',
  'exhibits.filter.building': 'Building',
  'exhibits.filter.space': 'Space',
  'exhibits.filter.sound': 'Sound',
  'exhibits.filter.nature': 'Nature',
  'exhibits.filter.calm': 'Calm',
  'exhibits.filter.results': '{count} exhibits shown',
  'exhibits.card.duration': '{minutes} min',
  'exhibits.card.details': 'Details',
  'exhibits.card.addToPlan': 'Add to my plan',
  'exhibits.card.inPlan': 'Added to plan',
  'exhibits.card.calm': 'Calm',
  'exhibits.card.lively': 'Lively',
  'exhibits.card.favourites': '{count} visitors added this',
  'exhibits.view.chart': 'Sky chart',
  'exhibits.view.list': 'List',
  'exhibits.chart.label': 'Floor chart of five ground-floor exhibits',
  'exhibits.quickView': 'Quick view',
  'exhibits.openFull': 'Open full page',
  'exhibits.sensory': 'Sensory note',
  'exhibits.floor': 'Ground floor',
  'exhibits.zone': 'Zone',
  'exhibits.whatYoullDo': 'What you’ll do',
  'exhibits.tips': 'Tips',
  'exhibits.back': 'Back to exhibits',
  'exhibits.notFound': 'We could not find that gallery.',
  'exhibits.age': 'Ages',

  // Planner
  'planner.badge': 'Smart Visit Engine',
  'planner.title': 'Generate Your Personal Visit Plan',
  'planner.subtitle':
    'Pick your available time and interests. Our knapsack engine creates an optimal itinerary with buffer time included.',
  'planner.time.label': 'Available time (minutes)',
  'planner.time.slider': 'Exact minutes: {minutes}',
  'planner.interests.label': 'What are you interested in?',
  'planner.interests.surprise': 'Surprise me',
  'planner.party.label': "Who's visiting?",
  'planner.party.adults': 'Adults (INR 100 each)',
  'planner.party.children': 'Children (INR 50 each)',
  'planner.stepFree.label': 'Require step-free / wheelchair routes',
  'planner.arrival.label': 'Arrival time',
  'planner.suggestTime': 'Suggest the best time',
  'planner.quiet.label': 'Quiet Visit Mode (calm-first itinerary & softer visual pacing)',
  'planner.output.summary':
    'Fits {count} activities in your {time} minutes ({used} min used, {spare} min spare)',
  'planner.output.cost': 'Estimated Admission: INR {cost}',
  'planner.actions.share': 'Share plan',
  'planner.actions.copy': 'Copy link',
  'planner.actions.copied': 'Link copied to clipboard!',
  'planner.actions.shortFallback':
    "Short links aren't available right now — copied the full link instead.",
  'planner.actions.calendar': 'Add to Calendar (.ics)',
  'planner.actions.print': 'Print Plan',
  'planner.actions.reset': 'Reset',
  'planner.save': 'Save this plan',
  'planner.saved': 'Saved to this device',
  'planner.unsave': 'Remove saved plan',
  'planner.empty': 'Adjust time or interests to build a route.',
  'planner.buffer': '5 min walk',
  'planner.live': 'Plan updated',
  'planner.console': 'Mission console',
  'planner.timeline': 'Visit timeline',
  'planner.date.label': 'Visit date',
  'planner.suggest.applied': 'Arrival set to {arrival} ({label})',
  'planner.monday': 'Closed on Mondays. Try Tuesday at 10:00.',

  // Explainer (E1)
  'explainer.title': 'Why this plan?',
  'explainer.summary': 'Used {used} of {capacity} minutes · Score {score}',
  'explainer.comparison.better':
    'The optimal plan scores {totalScore}; picking greedily by score would have scored {greedyScore}.',
  'explainer.comparison.same':
    'Greedy selection would have produced the same plan.',
  'explainer.th.exhibit': 'Exhibit',
  'explainer.th.duration': 'Duration',
  'explainer.th.score': 'Score',
  'explainer.th.status': 'Status',
  'explainer.reason.EXCEEDS_TIME': 'Exceeds available time limit',
  'explainer.reason.BETTER_COMBINATION': 'Excluded in favor of a higher-scoring combination',
  'explainer.reason.TRIMMED_FOR_CLOSING': 'Trimmed because schedule exceeds 17:00 closing',
  'explainer.chosen': 'Selected in plan',
  'explainer.budget': 'Time budget',

  // Structured Reasons
  'reason.MATCHES_INTEREST': 'Matches interests ({tags})',
  'reason.FAMILY_FRIENDLY': 'Family-friendly highlight',
  'reason.CALM_PICK': 'Calm space priority',
  'reason.FILLER_STOP': 'Fits perfectly in your schedule',
  'reason.SURPRISE_FALLBACK': 'Recommended discovery stop',

  // Structured Warnings
  'warning.TIME_TOO_SHORT':
    'Available time is shorter than our quickest activity ({min} min).',
  'warning.NO_INTEREST_MATCH':
    'No exhibits directly matched your chosen tags; showing best overall discoveries.',
  'warning.TRIMMED_FOR_CLOSING':
    'Some activities were trimmed because the centre closes at 17:00.',
  'warning.LATE_ARRIVAL':
    'Arrival is close to our 17:00 closing time.',
  'warning.LOUD_STOP_IN_QUIET_MODE':
    'Notice: This itinerary includes Echo Tunnel which has acoustic vibrations.',

  // Feedback Widget (E7)
  'feedback.question': 'Was this plan useful?',
  'feedback.yes': 'Yes, useful',
  'feedback.no': 'Could be better',
  'feedback.noteLabel': 'Optional comment (no personal data):',
  'feedback.submit': 'Submit Feedback',
  'feedback.thanks': 'Thank you! Your feedback helps us improve visit plans.',
  'feedback.privacyNote': "Please don't include names or personal details.",
  'feedback.unavailable': 'Feedback is resting this session — your plan still works offline.',

  // Best Time & Heatmap (E3)
  'bestTime.badge': 'Crowd Forecast',
  'bestTime.title': 'Best Times to Visit',
  'bestTime.subtitle':
    'Based on typical visitor patterns. Tuesday and Wednesday mornings offer the calmest experience.',
  'bestTime.legend.quiet': 'Quiet (< 35)',
  'bestTime.legend.moderate': 'Moderate (35–69)',
  'bestTime.legend.busy': 'Busy (≥ 70)',
  'bestTime.closedMonday': 'Closed on Mondays',
  'bestTime.quietestSentence': 'Quietest slot of the week: Tuesday 10:00–11:00 a.m.',
  'bestTime.disclaimer':
    'Note: Historical estimations are illustrative to help plan sensory-friendly visits.',
  'bestTime.chart': 'Weekly crowd ribbons from Tuesday to Sunday, 10:00 to 17:00',

  // Visit Section
  'visit.badge': 'Plan Your Visit',
  'visit.title': 'Essential Visitor Information',
  'visit.subtitle':
    'Everything you need for a smooth visit to 18 Garden Road, Riverdale.',
  'visit.tabs.hours': 'Hours & Crowds',
  'visit.tabs.location': 'Getting Here',
  'visit.tabs.tickets': 'Tickets & Admission',
  'visit.tabs.accessibility': 'Accessibility',
  'visit.tabs.faq': 'Frequently Asked Questions',
  'visit.openMaps': 'Open 18 Garden Road in Google Maps',
  'visit.pay': 'Pay at the reception desk via cash or UPI. Entry ticket covers all 5 exhibits.',
  'visit.faq.search': 'Search questions',
  'visit.faq.empty': 'No matching questions. Try another word.',
  'visit.hours.caption': 'Opening hours, Tuesday to Sunday',
  'visit.location.schematic': 'Schematic map of 18 Garden Road, Riverdale',

  // Social Proof (E7)
  'socialProof.stat': '{pct}% of visitors found their visit plan useful',
  'socialProof.basis': 'based on {count} visitor plans generated',
  'socialProof.kofn': '{k} of {n} visitors found their visit plan useful',

  // Quality Strip (E6)
  'quality.badge': 'Engineering Standards',
  'quality.title': 'Built with Verifiable Quality',
  'quality.subtitle':
    'Passing automated verification gates for accessibility, performance, and deterministic logic.',
  'quality.cta': 'View Full Quality Report',
  'quality.generated': 'Snapshot generated {date}',
  'quality.lighthouse': 'Lighthouse',
  'quality.axe': 'axe-core',
  'quality.tests': 'Tests',
  'quality.coverage': 'Lib coverage',
  'quality.perf': 'Performance',
  'quality.a11y': 'Accessibility',
  'quality.seo': 'SEO',
  'quality.bp': 'Best practices',
  'quality.lcp': 'LCP',
  'quality.cls': 'CLS',
  'quality.tbt': 'TBT',
  'quality.unit': 'Unit {passed}',
  'quality.api': 'API {passed}',
  'quality.e2e': 'E2E {passed}',
  'quality.violations': 'Serious and critical violations: {count}',
  'quality.page': 'Quality report',

  // Footer & Misc
  'footer.tagline': 'Northside Discovery Centre · 18 Garden Road, Riverdale',
  'footer.hours': 'Open Tue–Sun, 10:00 a.m. – 5:00 p.m. Closed Mondays.',
  'footer.admissions': 'Adult INR 100 · Child INR 50',
  'footer.accessibility': 'Accessibility Guide',
  'footer.privacy': 'Privacy Policy',
  'footer.quality': 'Quality & Testing',
  'footer.offline': 'Offline Plans',
  'footer.rights': 'All rights reserved. Fictional project for educational purposes.',

  // Preferences
  'prefs.title': 'Visit preferences',
  'prefs.theme': 'Theme',
  'prefs.theme.system': 'System',
  'prefs.theme.light': 'Dawn',
  'prefs.theme.dark': 'Night',
  'prefs.quiet': 'Quiet Visit Mode',
  'prefs.guide': 'Guide companion',
  'prefs.language': 'Language',
  'prefs.language.en': 'English',
  'prefs.language.ta': 'Tamil',

  // Saved plans
  'saved.empty': 'No saved plans on this device yet.',
  'saved.open': 'Open plan',
  'saved.remove': 'Remove',
  'saved.heading': 'Saved on this device',

  // Pages
  'page.back': 'Back to home',
  'page.notFound': 'That page is not on tonight’s chart.',
  'page.error': 'Something drifted off-course.',
  'page.retry': 'Try again',
  'plan.pageTitle': 'Your visit plan',
  'plan.missing': 'This short link has expired or could not be found.',
  'offline.title': 'Offline plans',
  'offline.body':
    'Plans saved on this device remain available without a network. The visit engine can still build a route from your last inputs.',
  'offline.empty': 'Save a plan from the planner to keep it here.',
  'privacy.title': 'Privacy',
  'privacy.intro':
    'Northside Discovery Centre does not require accounts. Feedback comments must not include names or personal details. Favourite counts and short links are anonymous. Nothing in this project is sold or used for advertising.',
  'privacy.storage':
    'This browser may store theme, quiet mode, guide preference, and up to five visit plans in local storage (ndc:theme, ndc:quiet, ndc:guide, ndc:plans:v1).',
  'privacy.contact': 'Questions: hello@northside-discovery.example',
  'a11y.title': 'Accessibility',
  'a11y.intro':
    'Ground floor and main exhibits are wheelchair accessible. Entrances are step-free, corridors are wide, and seating is available throughout.',
  'a11y.quiet':
    'Quiet Visit Mode reduces motion, prioritises calm galleries (Sky Room, Garden Trail), and points to quieter hours. Tuesday 10:00–11:00 is the calmest slot.',
  'a11y.keyboard':
    'All controls are reachable by keyboard. Skip to main content is the first focusable control. Focus is never trapped except inside dialogs.',

  'common.close': 'Close',
  'common.loading': 'Updating',
  'common.open': 'Open',
  'common.decrease': 'Decrease',
  'common.increase': 'Increase',
};

export type Dictionary = typeof en;
