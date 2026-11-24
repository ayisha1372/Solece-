// Edit scoring groups and evaluation messages here.
export const CATEGORIES = [
  { key: 'allah', label: 'Relationship with Allah', from: 1, to: 6, max: 30 },
  { key: 'character', label: 'Character & Self-discipline', from: 7, to: 10, max: 20 },
  { key: 'digital', label: 'Digital Responsibility', from: 11, to: 15, max: 25 },
];
export const EVALUATIONS = [
  { min: 60, name: 'Conscious Living', description: 'നല്ല ശീലങ്ങൾ വളർത്തിയെടുത്തിട്ടുണ്ട്. അവ സ്ഥിരതയോടെ നിലനിർത്താനും കൂടുതൽ മെച്ചപ്പെടുത്താനും ശ്രമിക്കുക.', opinion: 'Your habits show real awareness. Stay steady, stay humble, and keep asking Allah for consistency.' },
  { min: 45, name: 'The Awakening', description: 'നല്ല തിരിച്ചറിവുകളുണ്ട്. എന്നാൽ ചില മേഖലകളിൽ കൂടുതൽ ശ്രദ്ധയും സ്ഥിരതയും ആവശ്യമാണ്.', opinion: 'You are noticing the right things. Pick one area from your breakdown and give it a little more care this week.' },
  { min: 30, name: 'The Struggle', description: 'ദൈനംദിന ശീലങ്ങളിൽ ചില മാറ്റങ്ങൾ ആവശ്യമാണ്. ചെറിയ തീരുമാനങ്ങളിലൂടെ ആരംഭിക്കുക.', opinion: 'Everyone struggles at times. Honest reflection is already a step forward. Start with one small, doable habit.' },
  { min: 0, name: 'The First Step', description: 'സ്വയം തിരിച്ചറിയാനുള്ള ഒരു പുതിയ തുടക്കമാണിത്. ഇന്ന് തന്നെ ഒരു നല്ല ശീലം ആരംഭിക്കാം.', opinion: 'Beginning is the hardest part and you have done it. Allah loves those who keep returning. Start with one small thing today.' },
];
export const NOTE = 'This is a self-reflection tool, not a measure of your faith or worth.';
