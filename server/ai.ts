import { GoogleGenAI } from '@google/genai';
import { Language } from '../src/types';

// Curated instant-response knowledge base to minimize AI tokens and API calls
interface CachedFAQ {
  keywords: string[];
  answers: Record<Language, string>;
}

const FAQ_DATABASE: CachedFAQ[] = [
  {
    keywords: ["rice", "quota", "how much rice", "அரிசி", "బియ్యం", "चावल"],
    answers: {
      en: "Under the Public Distribution System (NFSA):\n• PHH (Priority Household): 5 kg rice per person per month (Free of cost).\n• AAY (Antyodaya Anna Yojana): 30 to 35 kg foodgrains per family per month (Free of cost).\n• NPHH (Non-Priority): 15-20 kg rice per family per month at nominal rate.",
      ta: "பொது விநியோகத் திட்டத்தின் கீழ் (NFSA):\n• முன்னுரிமை அட்டை (PHH): நபருக்கு தலா 5 கிலோ இலவச அரிசி வழங்கப்படுகிறது.\n• அந்தியோதயா அட்டை (AAY): குடும்பத்திற்கு தலா 35 கிலோ இலவச உணவு தானியங்கள் வழங்கப்படுகிறது.\n• முன்னுரிமையற்ற அட்டை (NPHH): குடும்பத்திற்கு 15 முதல் 20 கிலோ வரை அரிசி வழங்கப்படுகிறது.",
      te: "ప్రజా పంపిణీ వ్యవస్థ (NFSA) ప్రకారం:\n• PHH (ప్రాధాన్యత కార్డు): వ్యక్తికి 5 కిలోల ఉచిత బియ్యం.\n• AAY (అంత్యోదయ కార్డు): కుటుంబానికి నెలకు 30 నుండి 35 కిలోల ఉచిత ఆహార ధాన్యాలు.\n• NPHH: కుటుంబానికి నెలకు 15 నుండి 20 కిలోల బియ్యం.",
      hi: "सार्वजनिक वितरण प्रणाली (NFSA) के अंतर्गत:\n• PHH (प्राथमिकता परिवार): प्रति व्यक्ति 5 किग्रा चावल निःशुल्क।\n• AAY (अंत्योदय अन्न योजना): प्रति परिवार 30 से 35 किग्रा खाद्यान्न निःशुल्क।\n• NPHH (गैर-प्राथमिकता): प्रति परिवार 15 से 20 किग्रा चावल नाममात्र दर पर।"
    }
  },
  {
    keywords: ["price", "sugar", "oil", "cost", "rate", "விலை", "சர்க்கரை", "எண்ணெய்", "ధర", "చక్కెర", "నూనె", "दाम", "चीनी", "तेल"],
    answers: {
      en: "Standard Fair Price Shop Rates:\n• Rice: ₹0 / kg (Free under NFSA/State scheme)\n• Sugar: ₹25 / kg\n• Fortified Cooking Oil: ₹25 per 1-litre sealed packet\n• Pulses (Toor/Urad dal): ₹30 / kg",
      ta: "நியாயவிலைக் கடை அரசு நிர்ணயித்த விலைகள்:\n• அரிசி: ₹0 (இலவசம்)\n• சர்க்கரை: ₹25 / கிலோ\n• செறிவூட்டப்பட்ட சமையல் பாமாயில்: ₹25 / 1 லிட்டர் பாக்கெட்\n• துவரம் பருப்பு / உளுந்து: ₹30 / கிலோ",
      te: "రేషన్ దుకాణంలో ప్రభుత్వ ధరలు:\n• బియ్యం: ఉచితం (₹0)\n• చక్కెర: ₹25 / కిలో\n• వంట నూనె: ₹25 / 1 లీటర్ ప్యాకెట్\n• కందిపప్పు: ₹30 / కిలో",
      hi: "उचित मूल्य दुकान की आधिकारिक दरें:\n• चावल: ₹0 (निःशुल्क)\n• चीनी: ₹25 / किग्रा\n• फोर्टिफाइड खाद्य तेल: ₹25 / 1 लीटर पैकेट\n• दाल (अरहर/उड़द): ₹30 / किग्रा"
    }
  },
  {
    keywords: ["token", "queue", "how token works", "டோக்கன்", "வரிசை", "టోకెన్", "క్యూ", "टोकन", "कतार"],
    answers: {
      en: "How Smart Token System Works:\n1. Verify your ration card to generate a unique digital token.\n2. The system operates on strict First-In First-Out (FIFO) queue principles.\n3. Monitor your live position and estimated wait time.\n4. You will receive automatic Telegram alerts when approx 10 customers are ahead and when called at the counter.",
      ta: "ஸ்மார்ட் டோக்கன் முறை செயல்படும் விதம்:\n1. உங்கள் ரேஷன் கார்டைச் சரிபார்த்து டிஜிட்டல் டோக்கனைப் பெறுங்கள்.\n2. வரிசை முழுமையான FIFO (முதலில் வருபவருக்கு முன்னுரிமை) முறையில் இயங்குகிறது.\n3. நிகழ்நேர இடம் மற்றும் காத்திருப்பு நேரத்தை அறியலாம்.\n4. உங்களுக்கு முன் 10 பேர் இருக்கும்போதும், கவுண்டர் அழைப்பின்போதும் டெலிகிராம் தகவல் தானாக வரும்.",
      te: "స్మార్ట్ టోకెన్ పనిచేసే విధానం:\n1. మీ కార్డును ధృవీకరించి డిజిటల్ టోకెన్ పొందండి.\n2. ఇది ఖచ్చితమైన FIFO (మొదట వచ్చిన వారికి మొదటి ప్రాధాన్యత) ప్రకారం పనిచేస్తుంది.\n3. మీ క్యూ స్థానం మరియు సమయాన్ని తెలుసుకోవచ్చు.\n4. మీ కంటే ముందు 10 మంది ఉన్నప్పుడు మరియు కౌంటర్‌కు పిలిచినప్పుడు టెలిగ్రామ్ అలర్ట్ వస్తుంది.",
      hi: "स्मार्ट टोकन प्रणाली की कार्यविधि:\n1. अपना राशन कार्ड सत्यापित कर डिजिटल टोकन प्राप्त करें।\n2. यह पूरी तरह से FIFO (पहले आओ पहले पाओ) आधार पर संचालित होती है।\n3. आप अपना लाइव स्थान और प्रतीक्षा समय देख सकते हैं।\n4. आपके आगे 10 लोग होने पर और काउंटर बुलाने पर स्वचालित टेलीग्राम अलर्ट प्राप्त होगा।"
    }
  },
  {
    keywords: ["timing", "hours", "open", "நேரம்", "கடை நேரம்", "సమయాలు", "समय", "दुकान कब खुलती"],
    answers: {
      en: "Fair Price Shop Standard Timings:\n• Morning Session: 8:30 AM to 12:30 PM\n• Afternoon Session: 3:00 PM to 7:00 PM\n• Closed on: First Fridays of the month and declared state public holidays.",
      ta: "நியாயவிலைக் கடை இயங்கும் பொதுவான நேரங்கள்:\n• காலை வேலை: காலை 8:30 முதல் மதியம் 12:30 வரை\n• மாலை வேலை: பிற்பகல் 3:00 முதல் இரவு 7:00 வரை\n• விடுமுறை: மாதத்தின் முதல் வெள்ளிக்கிழமை மற்றும் அரசு பொது விடுமுறை நாட்கள்.",
      te: "రేషన్ దుకాణం పని వేళలు:\n• ఉదయం: 8:30 నుండి మధ్యాహ్నం 12:30 వరకు\n• సాయంత్రం: 3:00 నుండి రాత్రి 7:00 వరకు\n• నెల మొదటి శుక్రవారం మరియు ప్రభుత్వ సెలవు దినాల్లో సెలవు.",
      hi: "उचित मूल्य दुकान का कार्य समय:\n• प्रातः सत्र: सुबह 8:30 से दोपहर 12:30 तक\n• सायंकाल सत्र: दोपहर 3:00 से शाम 7:00 तक\n• अवकाश: माह के पहले शुक्रवार और सार्वजनिक अवकाश के दिन दुकान बंद रहती है।"
    }
  },
  {
    keywords: ["helpline", "complaint", "grievance", "toll free", "புகார்", "ஹெல்ப்லைன்", "ఫిర్యాదు", "హెల్ప్‌లైన్", "हेल्पलाइन", "शिकायत"],
    answers: {
      en: "PDS Helpline & Grievance Redressal:\n• National Toll-Free: 1967\n• State Consumer Helpline: 1800-425-5901\n• SMS Grievance: Text 'PDS <complaint>' to 9773901122",
      ta: "பொது விநியோகத் திட்ட உதவி எண்கள்:\n• தேசிய கட்டணமில்லா எண்: 1967\n• மாநில நுகர்வோர் உதவி எண்: 1800-425-5901\n• குறுஞ்செய்தி மூலம் புகார்: 9773901122 என்ற எண்ணிற்கு தொடர்பு கொள்ளவும்.",
      te: "ప్రజా పంపిణీ సహాయ మరియు ఫిర్యాదుల నంబర్లు:\n• జాతీయ టోల్ ఫ్రీ: 1967\n• రాష్ట్ర వినియోగదారుల హెల్ప్‌లైన్: 1800-425-5901",
      hi: "सार्वजनिक वितरण हेल्पलाइन एवं शिकायत निवारण:\n• राष्ट्रीय टोल-फ्री नंबर: 1967\n• राज्य उपभोक्ता हेल्पलाइन: 1800-425-5901"
    }
  }
];

export async function askRationAi(query: string, language: Language): Promise<string> {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Check local cached knowledge base to avoid unneeded API calls
  for (const faq of FAQ_DATABASE) {
    const matched = faq.keywords.some(k => cleanQuery.includes(k.toLowerCase()));
    if (matched) {
      return faq.answers[language] || faq.answers.en;
    }
  }

  // 2. Fall back to Gemini API only when necessary
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return FAQ_DATABASE[0].answers[language] || "For PDS information, please refer to the Civil Supplies portal or dial toll-free 1967.";
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are a helpful and concise Indian Public Distribution System (PDS / Ration Shop) assistant for Fair Price Shops.
User question: "${query}"
Language requested: ${language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}.

Instructions:
- Respond ONLY in the requested language (${language}).
- Keep the response concise, factual, and helpful (max 3-4 bullet points or under 90 words).
- Provide accurate government PDS guidelines (NFSA rules, ration card categories like PHH/AAY/NPHH, foodgrain entitlements, or shop processes).
- Do not mention external unrelated topics.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 250,
        temperature: 0.2
      }
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }
  } catch (error) {
    console.error('[AI Assistant] Error calling Gemini API:', error);
  }

  // Fallback to default FAQ
  return FAQ_DATABASE[0].answers[language] || "Please visit Fair Price Shop #42 or call toll-free helpline 1967 for detailed assistance.";
}
