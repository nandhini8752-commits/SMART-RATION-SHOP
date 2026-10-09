import { Language } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  shopName: string;
  shopLocation: string;
  liveStatus: string;
  
  // Navigation
  navCustomer: string;
  navEmployee: string;
  navAi: string;
  navLanguage: string;
  
  // Customer Portal
  customerPortalTitle: string;
  customerPortalDesc: string;
  rationCardLabel: string;
  rationCardPlaceholder: string;
  verifyCardBtn: string;
  verifying: string;
  sampleCardsLabel: string;
  cardVerifiedSuccess: string;
  cardDetailsTitle: string;
  cardHolder: string;
  cardType: string;
  familyMembers: string;
  registeredMobile: string;
  telegramAccount: string;
  telegramOptionalHint: string;
  telegramInputPlaceholder: string;
  updateTelegramBtn: string;
  monthlyEntitlements: string;
  rice: string;
  sugar: string;
  pulses: string;
  oil: string;
  kgUnit: string;
  packetUnit: string;
  generateTokenBtn: string;
  generatingToken: string;
  alreadyHaveToken: string;
  
  // Token Display
  yourTokenNumber: string;
  queuePosition: string;
  customersAhead: string;
  estimatedWaitTime: string;
  minutes: string;
  status: string;
  statusWaiting: string;
  statusServing: string;
  statusCompleted: string;
  statusCancelled: string;
  counterNotice: string;
  telegramAlertsActive: string;
  telegramReminderNotice: string;
  cancelTokenBtn: string;
  activeTokenWarning: string;
  backToVerification: string;

  // Employee Portal
  employeePortalTitle: string;
  employeeLoginTitle: string;
  employeeLoginDesc: string;
  staffIdLabel: string;
  passwordLabel: string;
  loginBtn: string;
  logoutBtn: string;
  loginError: string;
  stockManagementTitle: string;
  stockSubtitle: string;
  currentStock: string;
  updateStockBtn: string;
  savingStock: string;
  stockUpdateSuccess: string;
  reasonForUpdate: string;
  reasonPlaceholder: string;
  safeStockBadge: string;
  lowStockAlert: string;
  
  // Queue Management (Employee)
  queueControlTitle: string;
  currentlyServing: string;
  noCustomerServing: string;
  callNextBtn: string;
  dispenseAndCompleteBtn: string;
  dispensing: string;
  dispensedSuccess: string;
  waitingQueueCount: string;
  completedTodayCount: string;
  stockSafetyCheck: string;
  insufficientStockWarning: string;
  emptyQueue: string;
  
  // AI Assistant
  aiTitle: string;
  aiSubtitle: string;
  aiPlaceholder: string;
  askBtn: string;
  thinking: string;
  quickQuestionsTitle: string;
  disclaimer: string;
  
  // General & Errors
  errorCardNotFound: string;
  errorServer: string;
  refreshQueue: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Smart Ration Queue Management",
    appSubtitle: "Fair Price Shop e-Token & Inventory System",
    shopName: "Fair Price Shop #42",
    shopLocation: "Anna Nagar West, Chennai",
    liveStatus: "Shop Open • Active FIFO Queue",
    
    navCustomer: "Customer Portal",
    navEmployee: "Employee Portal",
    navAi: "AI Assistant",
    navLanguage: "Language",
    
    customerPortalTitle: "Ration Beneficiary Portal",
    customerPortalDesc: "Verify your ration card number to securely view entitlements and generate your digital queue token.",
    rationCardLabel: "Ration Card Number",
    rationCardPlaceholder: "Enter 12-digit Ration Card (e.g., TN-02-PHH-8821)",
    verifyCardBtn: "Verify Card",
    verifying: "Verifying...",
    sampleCardsLabel: "Quick-fill demo ration cards:",
    cardVerifiedSuccess: "Ration Card verified successfully!",
    cardDetailsTitle: "Beneficiary Verification Details",
    cardHolder: "Cardholder Name",
    cardType: "Card Category",
    familyMembers: "Family Members",
    registeredMobile: "Registered Mobile Number",
    telegramAccount: "Linked Telegram Account",
    telegramOptionalHint: "Receive instant token confirmation and 10-customer-ahead alerts directly on Telegram.",
    telegramInputPlaceholder: "Enter Telegram Chat ID (e.g. 123456789 or @username)",
    updateTelegramBtn: "Save Telegram ID",
    monthlyEntitlements: "Eligible Monthly Entitlement",
    rice: "Rice",
    sugar: "Sugar",
    pulses: "Pulses (Dal)",
    oil: "Fortified Cooking Oil",
    kgUnit: "kg",
    packetUnit: "1L packet(s)",
    generateTokenBtn: "Generate Queue Token",
    generatingToken: "Generating Token...",
    alreadyHaveToken: "You have an active token in the queue",
    
    yourTokenNumber: "Your Token Number",
    queuePosition: "Queue Position",
    customersAhead: "Customers Ahead",
    estimatedWaitTime: "Estimated Waiting Time",
    minutes: "minutes",
    status: "Status",
    statusWaiting: "Waiting in Queue",
    statusServing: "Now Serving at Counter",
    statusCompleted: "Ration Collected (Completed)",
    statusCancelled: "Cancelled",
    counterNotice: "Please be ready at Counter 1 when token is called.",
    telegramAlertsActive: "Telegram Alerts Active",
    telegramReminderNotice: "You will receive an automated Telegram alert when approximately 10 customers are ahead.",
    cancelTokenBtn: "Cancel My Token",
    activeTokenWarning: "Please do not leave the premises once your token reaches top 5.",
    backToVerification: "Check Another Card",

    employeePortalTitle: "FPS Staff Administration Portal",
    employeeLoginTitle: "Staff Authorization",
    employeeLoginDesc: "Secure access for Fair Price Shop employees and counter in-charge officers.",
    staffIdLabel: "Employee ID",
    passwordLabel: "Password / PIN",
    loginBtn: "Staff Login",
    logoutBtn: "Sign Out",
    loginError: "Invalid Employee ID or Password. (Demo: EMP-101 / 1234)",
    stockManagementTitle: "Commodity Stock Inventory Update",
    stockSubtitle: "Update daily opening or received supplies. All updates are logged in the audit database.",
    currentStock: "Current Available Stock",
    updateStockBtn: "Save Stock to Database",
    savingStock: "Saving to Database...",
    stockUpdateSuccess: "Stock levels updated and synchronized successfully!",
    reasonForUpdate: "Update Reason / Stock Receipt Note",
    reasonPlaceholder: "e.g., Received fresh quota from Civil Supplies warehouse",
    safeStockBadge: "Adequate Stock",
    lowStockAlert: "Low Stock Alert! Immediate replenishment needed.",
    
    queueControlTitle: "Real-time FIFO Queue Management",
    currentlyServing: "Currently Serving Beneficiary",
    noCustomerServing: "No token currently being served. Click 'Call Next Token' to begin.",
    callNextBtn: "Call Next Token (FIFO)",
    dispenseAndCompleteBtn: "Dispense Commodities & Mark Complete",
    dispensing: "Processing Transaction...",
    dispensedSuccess: "Ration dispensed and stock deducted safely!",
    waitingQueueCount: "Waiting in Queue",
    completedTodayCount: "Served Today",
    stockSafetyCheck: "Stock Safety Verification",
    insufficientStockWarning: "Cannot dispense: Available stock is lower than required entitlement!",
    emptyQueue: "Queue is currently empty. Waiting for new beneficiaries.",
    
    aiTitle: "Smart Ration AI Assistant",
    aiSubtitle: "Ask any question about ration card rules, quotas, prices, timings, and government guidelines.",
    aiPlaceholder: "e.g., What is my rice entitlement? What are the shop timings?",
    askBtn: "Ask Assistant",
    thinking: "Finding accurate PDS regulations...",
    quickQuestionsTitle: "Frequently Asked Questions",
    disclaimer: "AI assistant follows official National Food Security Act (NFSA) & PDS state civil supplies guidelines.",
    
    errorCardNotFound: "Ration card number not found in database. Please check number.",
    errorServer: "Communication error with server. Please try again.",
    refreshQueue: "Refresh Queue Data"
  },
  
  ta: {
    appName: "ஸ்மார்ட் ரேஷன் வரிசை மேலாண்மை",
    appSubtitle: "நியாயவிலைக் கடை மின்னணு டோக்கன் & சரக்கு மேலாண்மை அமைப்பு",
    shopName: "நியாயவிலைக் கடை எண் #42",
    shopLocation: "அண்ணா நகர் மேற்கு, சென்னை",
    liveStatus: "கடை திறந்துள்ளது • நிகழ்நேர FIFO வரிசை இயங்குகிறது",
    
    navCustomer: "பயனாளர் போர்டல்",
    navEmployee: "ஊழியர் போர்டல்",
    navAi: "AI உதவியாளர்",
    navLanguage: "மொழி",
    
    customerPortalTitle: "ரேஷன் குடும்ப அட்டைதாரர் போர்டல்",
    customerPortalDesc: "உங்கள் ரேஷன் கார்டு எண்ணை சரிபார்த்து, உங்கள் உரிமைகளைக் கண்டு, வரிசைக்கான டிஜிட்டல் டோக்கனைப் பெறுங்கள்.",
    rationCardLabel: "குடும்ப அட்டை (ரேஷன் கார்டு) எண்",
    rationCardPlaceholder: "12 இலக்க அட்டை எண் (எ.கா: TN-02-PHH-8821)",
    verifyCardBtn: "அட்டையைச் சரிபார்க்கவும்",
    verifying: "சரிபார்க்கிறது...",
    sampleCardsLabel: "மாதிரி ரேஷன் கார்டுகள்:",
    cardVerifiedSuccess: "ரேஷன் கார்டு வெற்றிகரமாக சரிபார்க்கப்பட்டது!",
    cardDetailsTitle: "பயனாளி சரிபார்ப்பு விவரங்கள்",
    cardHolder: "குடும்பத் தலைவர் பெயர்",
    cardType: "அட்டை வகை",
    familyMembers: "குடும்ப உறுப்பினர்கள்",
    registeredMobile: "பதிவு செய்யப்பட்ட மொபைல் எண்",
    telegramAccount: "இணைக்கப்பட்ட டெலிகிராம் கணக்கு",
    telegramOptionalHint: "டோக்கன் உறுதிப்படுத்தல் மற்றும் வரிசையில் 10 பேர் இருக்கும்போது டெலிகிராமில் எச்சரிக்கையைப் பெறுங்கள்.",
    telegramInputPlaceholder: "டெலிகிராம் Chat ID (எ.கா: 123456789 அல்லது @பெயர்)",
    updateTelegramBtn: "டெலிகிராம் ஐடியைச் சேமிக்கவும்",
    monthlyEntitlements: "மாதாந்திர தகுதியான ரேஷன் பொருட்கள்",
    rice: "அரிசி",
    sugar: "சர்க்கரை",
    pulses: "துவரம் பருப்பு",
    oil: "செறிவூட்டப்பட்ட சமையல் எண்ணெய்",
    kgUnit: "கிலோ",
    packetUnit: "1 லிட்டர் பாக்கெட்",
    generateTokenBtn: "வரிசை டோக்கனைப் பெறுக",
    generatingToken: "டோக்கன் உருவாக்கப்படுகிறது...",
    alreadyHaveToken: "உங்களிடம் ஏற்கனவே வரிசையில் டோக்கன் உள்ளது",
    
    yourTokenNumber: "உங்கள் டோக்கன் எண்",
    queuePosition: "வரிசை இடம்",
    customersAhead: "உங்களுக்கு முன் உள்ளவர்கள்",
    estimatedWaitTime: "தோராயமான காத்திருப்பு நேரம்",
    minutes: "நிமிடங்கள்",
    status: "நிலை",
    statusWaiting: "வரிசையில் காத்திருக்கிறார்",
    statusServing: "கவுண்டரில் சேவை பெறுகிறார்",
    statusCompleted: "பொருட்கள் பெறப்பட்டன (முடிந்தது)",
    statusCancelled: "ரத்து செய்யப்பட்டது",
    counterNotice: "உங்கள் டோக்கன் அழைக்கப்படும் போது கவுண்டர் 1-க்கு வரவும்.",
    telegramAlertsActive: "டெலிகிராம் எச்சரிக்கை இயக்கத்தில் உள்ளது",
    telegramReminderNotice: "உங்களுக்கு முன் தோராயமாக 10 பேர் இருக்கும்போது தானியங்கி டெலிகிராம் தகவல் அனுப்பப்படும்.",
    cancelTokenBtn: "டோக்கனை ரத்து செய்",
    activeTokenWarning: "உங்கள் டோக்கன் முதல் 5 இடத்திற்கு வந்தவுடன் வரிசைப் பகுதியை விட்டுச் செல்ல வேண்டாம்.",
    backToVerification: "வேறு அட்டையைச் சரிபார்க்க",

    employeePortalTitle: "நியாயவிலைக் கடை ஊழியர் போர்டல்",
    employeeLoginTitle: "ஊழியர் உள்நுழைவு",
    employeeLoginDesc: "நியாயவிலைக் கடை ஊழியர்கள் மற்றும் பொறுப்பாளர்களுக்கான பாதுகாப்பான தளம்.",
    staffIdLabel: "பணியாளர் ஐடி",
    passwordLabel: "கடவுச்சொல் / பின்",
    loginBtn: "உள்நுழைக",
    logoutBtn: "வெளியேறு",
    loginError: "தவறான பணியாளர் ஐடி அல்லது கடவுச்சொல். (டெமோ: EMP-101 / 1234)",
    stockManagementTitle: "சரக்கு இருப்பு புதுப்பிப்பு படிவம்",
    stockSubtitle: "தினசரி இருப்பு அல்லது பெறப்பட்ட சரக்குகளைப் புதுப்பிக்கவும். அனைத்து விவரங்களும் தரவுத்தளத்தில் சேமிக்கப்படும்.",
    currentStock: "தற்போதைய கையிருப்பு",
    updateStockBtn: "இருப்பை தரவுத்தளத்தில் சேமிக்கவும்",
    savingStock: "தரவுத்தளத்தில் சேமிக்கிறது...",
    stockUpdateSuccess: "சரக்கு இருப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    reasonForUpdate: "புதுப்பிப்பதற்கான காரணம் / ரசீது குறிப்பு",
    reasonPlaceholder: "எ.கா: தமிழ்நாடு நுகர்பொருள் வாணிபக் கழகத்திடமிருந்து புதிய சரக்கு பெறப்பட்டது",
    safeStockBadge: "போதுமான இருப்பு",
    lowStockAlert: "குறைந்த இருப்பு எச்சரிக்கை! உடனடியாக சரக்கு தேவை.",
    
    queueControlTitle: "நிகழ்நேர FIFO வரிசை மேலாண்மை",
    currentlyServing: "தற்போது சேவை பெறும் பயனாளி",
    noCustomerServing: "தற்போது யாரும் அழைக்கப்படவில்லை. தொடங்க 'அடுத்த டோக்கனை அழைக்கவும்' என்பதைக் கிளிக் செய்யவும்.",
    callNextBtn: "அடுத்த டோக்கனை அழைக்கவும் (FIFO)",
    dispenseAndCompleteBtn: "பொருட்களை வழங்கி முடிக்கவும்",
    dispensing: "செயலாக்கப்படுகிறது...",
    dispensedSuccess: "பொருட்கள் வழங்கப்பட்டு இருப்பு பாதுகாப்பாக கழிக்கப்பட்டது!",
    waitingQueueCount: "வரிசையில் காத்திருப்போர்",
    completedTodayCount: "இன்று பொருட்கள் பெற்றோர்",
    stockSafetyCheck: "சரக்கு பாதுகாப்பு சரிபார்ப்பு",
    insufficientStockWarning: "பொருட்களை வழங்க இயலாது: தேவையான அளவை விட கையிருப்பு குறைவாக உள்ளது!",
    emptyQueue: "வரிசையில் தற்போது யாரும் இல்லை.",
    
    aiTitle: "ஸ்மார்ட் ரேஷன் AI உதவியாளர்",
    aiSubtitle: "ரேஷன் கார்டு விதிகள், ஒதுக்கீடு, விலைகள், கடை நேரம் குறித்த உங்கள் கேள்விகளுக்கு பதில்கள்.",
    aiPlaceholder: "எ.கா: இந்த மாதம் எனக்கு எவ்வளவு அரிசி கிடைக்கும்? கடை இயங்கும் நேரம் என்ன?",
    askBtn: "கேள்வி கேட்க",
    thinking: "உணவு வழங்கல் துறை விதிமுறைகளைத் தேடுகிறது...",
    quickQuestionsTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    disclaimer: "AI உதவியாளர் தேசிய உணவுப் பாதுகாப்பு சட்டம் (NFSA) மற்றும் தமிழக பொது விநியோகத் திட்ட விதிகளின்படி செயல்படுகிறது.",
    
    errorCardNotFound: "ரேஷன் கார்டு எண் தரவுத்தளத்தில் இல்லை. தயவுசெய்து சரிபார்க்கவும்.",
    errorServer: "சேவையகத்துடன் தொடர்பு கொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    refreshQueue: "வரிசையைப் புதுப்பிக்கவும்"
  },

  te: {
    appName: "స్మార్ట్ రేషన్ క్యూ నిర్వహణ",
    appSubtitle: "సరసమైన ధరల దుకాణం ఈ-టోకెన్ & నిల్వల వ్యవస్థ",
    shopName: "రేషన్ దుకాణం #42",
    shopLocation: "అన్నా నగర్ వెస్ట్, చెన్నై",
    liveStatus: "దుకాణం తెరిచి ఉంది • లైవ్ FIFO క్యూ నడుస్తోంది",
    
    navCustomer: "వినియోగదారుల పోర్టల్",
    navEmployee: "సిబ్బంది పోర్టల్",
    navAi: "AI అసిస్టెంట్",
    navLanguage: "భాష",
    
    customerPortalTitle: "రేషన్ లబ్ధిదారుల పోర్టల్",
    customerPortalDesc: "మీ రేషన్ కార్డు సంఖ్యను నమోదు చేసి, మీ అర్హతలను తెలుసుకొని, డిజిటల్ క్యూ టోకెన్‌ను పొందండి.",
    rationCardLabel: "రేషన్ కార్డు నంబర్",
    rationCardPlaceholder: "12 అంకెల కార్డు నంబర్ (ఉదా: TN-02-PHH-8821)",
    verifyCardBtn: "కార్డును ధృవీకరించండి",
    verifying: "ధృవీకరిస్తోంది...",
    sampleCardsLabel: "నమూనా రేషన్ కార్డులు:",
    cardVerifiedSuccess: "రేషన్ కార్డు విజయవంతంగా ధృవీకరించబడింది!",
    cardDetailsTitle: "లబ్ధిదారుని ధృవీకరణ వివరాలు",
    cardHolder: "కార్డుదారుని పేరు",
    cardType: "కార్డు వర్గం",
    familyMembers: "కుటుంబ సభ్యులు",
    registeredMobile: "నమోదిత మొబైల్ నంబర్",
    telegramAccount: "లింక్ చేసిన టెలిగ్రామ్ ఖాతా",
    telegramOptionalHint: "టోకెన్ కన్ఫర్మేషన్ మరియు క్యూలో మీ కంటే ముందు 10 మంది ఉన్నప్పుడు టెలిగ్రామ్‌లో అలర్ట్ పొందండి.",
    telegramInputPlaceholder: "టెలిగ్రామ్ Chat ID (ఉదా: 123456789 లేదా @యూజర్)",
    updateTelegramBtn: "టెలిగ్రామ్ ఐడీ సేవ్ చేయండి",
    monthlyEntitlements: "ఈ నెలకు అర్హత గల రేషన్ సరుకులు",
    rice: "బియ్యం",
    sugar: "చక్కెర",
    pulses: "కందిపప్పు",
    oil: "వంట నూనె",
    kgUnit: "కిలోలు",
    packetUnit: "1 లీటర్ ప్యాకెట్",
    generateTokenBtn: "క్యూ టోకెన్ పొందండి",
    generatingToken: "టోకెన్ జారీ అవుతోంది...",
    alreadyHaveToken: "మీకు ఇప్పటికే యాక్టివ్ టోకెన్ ఉంది",
    
    yourTokenNumber: "మీ టోకెన్ నంబర్",
    queuePosition: "క్యూ స్థానం",
    customersAhead: "మీ ముందున్న వ్యక్తులు",
    estimatedWaitTime: "అంచనా వేసిన నిరీక్షణ సమయం",
    minutes: "నిమిషాలు",
    status: "స్థితి",
    statusWaiting: "క్యూలో వేచి ఉన్నారు",
    statusServing: "కౌంటర్‌లో ఉన్నారు",
    statusCompleted: "సరుకులు అందజేయబడ్డాయి (పూర్తయింది)",
    statusCancelled: "రద్దు చేయబడింది",
    counterNotice: "మీ టోకెన్ పిలిచినప్పుడు కౌంటర్ 1 వద్దకు రండి.",
    telegramAlertsActive: "టెలిగ్రామ్ అలర్ట్స్ యాక్టివ్‌గా ఉన్నాయి",
    telegramReminderNotice: "మీ కంటే ముందు దాదాపు 10 మంది ఉన్నప్పుడు మీకు ఆటోమేటిక్ టెలిగ్రామ్ మెసేజ్ వస్తుంది.",
    cancelTokenBtn: "టోకెన్ రద్దు చేయండి",
    activeTokenWarning: "మీ టోకెన్ టాప్ 5కి వచ్చినప్పుడు దయచేసి బయటకు వెళ్లకండి.",
    backToVerification: "మరొక కార్డును చూడండి",

    employeePortalTitle: "డీలర్/సిబ్బంది పోర్టల్",
    employeeLoginTitle: "సిబ్బంది లాగిన్",
    employeeLoginDesc: "రేషన్ దుకాణ సిబ్బంది కోసం సురక్షితమైన లాగిన్ వ్యవస్థ.",
    staffIdLabel: "ఎంప్లాయ్ ఐడీ",
    passwordLabel: "పాస్‌వర్డ్ / పిన్",
    loginBtn: "లాగిన్ అవ్వండి",
    logoutBtn: "లాగౌట్",
    loginError: "తప్పుడు ఎంప్లాయ్ ఐడీ లేదా పాస్‌వర్డ్. (డెమో: EMP-101 / 1234)",
    stockManagementTitle: "సరుకుల స్టాక్ అప్‌డేట్ ఫారమ్",
    stockSubtitle: "రోజువారీ ప్రారంభ నిల్వలను లేదా తాజా సరుకులను డేటాబేస్‌లో అప్‌డేట్ చేయండి.",
    currentStock: "ప్రస్తుత అందుబాటులో ఉన్న నిల్వలు",
    updateStockBtn: "స్టాక్‌ను డేటాబేస్‌లో సేవ్ చేయండి",
    savingStock: "సేవ్ అవుతోంది...",
    stockUpdateSuccess: "స్టాక్ విజయవంతంగా అప్‌డేట్ చేయబడింది!",
    reasonForUpdate: "అప్‌డేట్ చేయడానికి కారణం",
    reasonPlaceholder: "ఉదా: పౌర సరఫరాల గోడౌన్ నుండి తాజా నిల్వలు వచ్చాయి",
    safeStockBadge: "సరిపడా నిల్వలు ఉన్నాయి",
    lowStockAlert: "తక్కువ నిల్వ హెచ్చరిక! త్వరగా స్టాక్ అవసరం.",
    
    queueControlTitle: "లైవ్ FIFO క్యూ నిర్వహణ",
    currentlyServing: "ప్రస్తుతం సేవ పొందుతున్న లబ్ధిదారుడు",
    noCustomerServing: "ప్రస్తుతం ఎవరూ లేరు. ప్రారంభించడానికి 'తదుపరి టోకెన్ పిలవండి' క్లిక్ చేయండి.",
    callNextBtn: "తదుపరి టోకెన్ పిలవండి (FIFO)",
    dispenseAndCompleteBtn: "సరుకులు అందించి పూర్తి చేయండి",
    dispensing: "ప్రాసెస్ అవుతోంది...",
    dispensedSuccess: "సరుకులు విజయవంతంగా అందించబడ్డాయి, స్టాక్ తీసివేయబడింది!",
    waitingQueueCount: "క్యూలో వేచి ఉన్నవారు",
    completedTodayCount: "ఈ రోజు సరుకులు పొందినవారు",
    stockSafetyCheck: "స్టాక్ భద్రతా తనిఖీ",
    insufficientStockWarning: "సరుకులు అందించడం సాధ్యం కాదు: అవసరమైన కోటా కంటే అందుబాటులో ఉన్న స్టాక్ తక్కువగా ఉంది!",
    emptyQueue: "ప్రస్తుతం క్యూ ఖాళీగా ఉంది.",
    
    aiTitle: "స్మార్ట్ రేషన్ AI అసిస్టెంట్",
    aiSubtitle: "రేషన్ కార్డు నిబంధనలు, కోటాలు, ధరలు, సమయాలపై మీ ప్రశ్నలను అడగండి.",
    aiPlaceholder: "ఉదా: నాకు ఈ నెల ఎంత బియ్యం వస్తుంది? దుకాణం సమయాలు ఏమిటి?",
    askBtn: "ప్రశ్నించండి",
    thinking: "ప్రభుత్వ మార్గదర్శకాలను శోధిస్తోంది...",
    quickQuestionsTitle: "తరచుగా అడిగే ప్రశ్నలు",
    disclaimer: "AI అసిస్టెంట్ జాతీయ ఆహార భద్రతా చట్టం (NFSA) నిబంధనల ప్రకారం సమాధానం ఇస్తుంది.",
    
    errorCardNotFound: "రేషన్ కార్డు నంబర్ డేటాబేస్‌లో కనుగొనబడలేదు.",
    errorServer: "సర్వర్ తో కనెక్షన్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.",
    refreshQueue: "క్యూ సమాచారాన్ని రిఫ్రెష్ చేయండి"
  },

  hi: {
    appName: "स्मार्ट राशन कतार प्रबंधन",
    appSubtitle: "उचित मूल्य दुकान ई-टोकन एवं स्टॉक प्रबंधन प्रणाली",
    shopName: "उचित मूल्य राशन दुकान #42",
    shopLocation: "अन्ना नगर पश्चिम, चेन्नई",
    liveStatus: "दुकान खुली है • सक्रिय FIFO कतार जारी",
    
    navCustomer: "उपभोक्ता पोर्टल",
    navEmployee: "कर्मचारी पोर्टल",
    navAi: "AI सहायक",
    navLanguage: "भाषा",
    
    customerPortalTitle: "राशन लाभार्थी पोर्टल",
    customerPortalDesc: "अपना राशन कार्ड नंबर सत्यापित करें, अपनी मासिक पात्रता देखें और कतार का डिजिटल टोकन प्राप्त करें।",
    rationCardLabel: "राशन कार्ड संख्या",
    rationCardPlaceholder: "12-अंकीय राशन कार्ड नंबर (उदा: TN-02-PHH-8821)",
    verifyCardBtn: "कार्ड सत्यापित करें",
    verifying: "सत्यापित हो रहा है...",
    sampleCardsLabel: "नमूना राशन कार्ड चुनें:",
    cardVerifiedSuccess: "राशन कार्ड सफलतापूर्वक सत्यापित हुआ!",
    cardDetailsTitle: "लाभार्थी सत्यापन विवरण",
    cardHolder: "कार्डधारक का नाम",
    cardType: "कार्ड श्रेणी",
    familyMembers: "परिवार के सदस्य",
    registeredMobile: "पंजीकृत मोबाइल नंबर",
    telegramAccount: "लिंक्ड टेलीग्राम खाता",
    telegramOptionalHint: "टोकन पुष्टि और कतार में लगभग 10 लोग आगे होने पर सीधे टेलीग्राम पर अलर्ट प्राप्त करें।",
    telegramInputPlaceholder: "टेलीग्राम Chat ID दर्ज करें (उदा: 123456789 या @यूजरनेम)",
    updateTelegramBtn: "टेलीग्राम आईडी सहेजें",
    monthlyEntitlements: "मासिक पात्र राशन सामग्री",
    rice: "चावल",
    sugar: "चीनी",
    pulses: "दाल",
    oil: "खाद्य तेल",
    kgUnit: "किग्रा",
    packetUnit: "1 लीटर पैकेट",
    generateTokenBtn: "कतार टोकन प्राप्त करें",
    generatingToken: "टोकन बन रहा है...",
    alreadyHaveToken: "कतार में आपका टोकन पहले से सक्रिय है",
    
    yourTokenNumber: "आपका टोकन नंबर",
    queuePosition: "कतार में स्थान",
    customersAhead: "आपसे आगे कुल ग्राहक",
    estimatedWaitTime: "अनुमानित प्रतीक्षा समय",
    minutes: "मिनट",
    status: "स्थिति",
    statusWaiting: "कतार में प्रतीक्षारत",
    statusServing: "काउंटर पर राशन दिया जा रहा है",
    statusCompleted: "राशन प्राप्त हुआ (पूर्ण)",
    statusCancelled: "रद्द किया गया",
    counterNotice: "टोकन पुकारे जाने पर काउंटर 1 पर उपस्थित रहें।",
    telegramAlertsActive: "टेलीग्राम अलर्ट सक्रिय",
    telegramReminderNotice: "जब आपके आगे लगभग 10 ग्राहक शेष रहेंगे, तो आपको स्वतः टेलीग्राम सूचना प्राप्त होगी।",
    cancelTokenBtn: "मेरा टोकन रद्द करें",
    activeTokenWarning: "जब आपका टोकन पहले 5 में आ जाए, तो कृपया परिसर न छोड़ें।",
    backToVerification: "अन्य कार्ड जांचें",

    employeePortalTitle: "राशन डीलर / कर्मचारी पोर्टल",
    employeeLoginTitle: "कर्मचारी लॉगिन",
    employeeLoginDesc: "उचित मूल्य दुकान कर्मचारियों और प्रभारियों के लिए सुरक्षित प्रवेश।",
    staffIdLabel: "कर्मचारी आईडी",
    passwordLabel: "पासवर्ड / पिन",
    loginBtn: "कर्मचारी लॉगिन करें",
    logoutBtn: "लॉग आउट",
    loginError: "अमान्य कर्मचारी आईडी या पासवर्ड। (डेमो: EMP-101 / 1234)",
    stockManagementTitle: "वस्तु स्टॉक इन्वेंट्री अद्यतन फॉर्म",
    stockSubtitle: "दैनिक प्रारंभिक स्टॉक या प्राप्त सामग्री का विवरण भरें। सभी परिवर्तन डेटाबेस में सुरक्षित होंगे।",
    currentStock: "वर्तमान उपलब्ध स्टॉक",
    updateStockBtn: "स्टॉक डेटाबेस में सहेजें",
    savingStock: "डेटाबेस में सहेजा जा रहा है...",
    stockUpdateSuccess: "स्टॉक स्तर सफलतापूर्वक अपडेट किया गया!",
    reasonForUpdate: "अपडेट का कारण / रसीद विवरण",
    reasonPlaceholder: "उदा: नागरिक आपूर्ति गोदाम से नया कोटा प्राप्त हुआ",
    safeStockBadge: "पर्याप्त स्टॉक उपलब्ध",
    lowStockAlert: "कम स्टॉक चेतावनी! तुरंत पुनः आपूर्ति की आवश्यकता।",
    
    queueControlTitle: "लाइव FIFO कतार प्रबंधन",
    currentlyServing: "वर्तमान में राशन प्राप्त कर रहे लाभार्थी",
    noCustomerServing: "वर्तमान में कोई टोकन नहीं बुलाया गया है। शुरू करने के लिए 'अगला टोकन बुलाएं' दबाएं।",
    callNextBtn: "अगला टोकन बुलाएं (FIFO)",
    dispenseAndCompleteBtn: "सामग्री वितरित करें और पूर्ण करें",
    dispensing: "वितरण प्रक्रिया जारी...",
    dispensedSuccess: "राशन सुरक्षित रूप से वितरित हुआ और स्टॉक घटा दिया गया!",
    waitingQueueCount: "कतार में प्रतीक्षारत",
    completedTodayCount: "आज कुल वितरित",
    stockSafetyCheck: "स्टॉक सुरक्षा सत्यापन",
    insufficientStockWarning: "वितरित नहीं किया जा सकता: उपलब्ध स्टॉक आवश्यक पात्रता से कम है!",
    emptyQueue: "कतार वर्तमान में खाली है।",
    
    aiTitle: "स्मार्ट राशन AI सहायक",
    aiSubtitle: "राशन कार्ड के नियमों, मासिक कोटे, कीमतों, दुकान के समय पर अपने प्रश्न पूछें।",
    aiPlaceholder: "उदा: इस महीने मुझे कितना चावल मिलेगा? दुकान का समय क्या है?",
    askBtn: "सहायक से पूछें",
    thinking: "खाद्य एवं नागरिक आपूर्ति नियम खोजे जा रहे हैं...",
    quickQuestionsTitle: "अक्सर पूछे जाने वाले प्रश्न",
    disclaimer: "AI सहायक राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) एवं सरकारी नियमों पर आधारित उत्तर देता है।",
    
    errorCardNotFound: "राशन कार्ड नंबर डेटाबेस में नहीं मिला। कृपया नंबर जांचें।",
    errorServer: "सर्वर से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।",
    refreshQueue: "कतार डेटा ताज़ा करें"
  }
};
