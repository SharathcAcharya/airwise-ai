/**
 * Rule-based environmental intelligence engine for AirWise Assistant
 * Supports grounded CPCB standards and multi-language responses (EN, KN, HI, TA, BN, MR)
 */

export function generateRuleBasedResponse(
  query: string,
  env: any,
  profile?: any,
  language: string = 'en'
): string {
  // Normalize typographic curly apostrophes and punctuation
  const cleanQ = query.replace(/[’‘]/g, "'").toLowerCase();

  const aqi = env?.aqi ?? env?.indicativeAqi ?? 160;
  const cat = env?.category || 'Moderate';
  const dominant = env?.dominantPollutant?.toUpperCase() || 'PM2.5';
  const pm25 = env?.pm25 ?? 75;
  const location = env?.locationName || 'Region';

  // Detect language if specified or by script in query
  let lang = language.toLowerCase();
  if (/[\u0C80-\u0CFF]/.test(query)) lang = 'kn';
  else if (/[\u0900-\u097F]/.test(query) && lang !== 'mr') lang = 'hi';
  else if (/[\u0B80-\u0BFF]/.test(query)) lang = 'ta';
  else if (/[\u0980-\u09FF]/.test(query)) lang = 'bn';

  // Question 1: Running and outdoor workouts
  if (
    cleanQ.includes('running') || cleanQ.includes('run') || cleanQ.includes('exercise') || cleanQ.includes('jog') || cleanQ.includes('workout') ||
    cleanQ.includes('ಓಟ') || cleanQ.includes('ವ್ಯಾಯಾಮ') || cleanQ.includes('दौड़') || cleanQ.includes('व्यायाम') ||
    cleanQ.includes('ஓட்டம்') || cleanQ.includes('உடற்பயிற்சி') || cleanQ.includes('দৌড়') || cleanQ.includes('ব্যায়াম')
  ) {
    if (lang === 'kn') {
      return aqi <= 100
        ? `### ಹೊರಾಂಗಣ ವ್ಯಾಯಾಮ ಸಲಹೆ: ಓಟಕ್ಕೆ ಸುರಕ್ಷಿತ\n\n- **ಪ್ರಸ್ತುತ ವಾಯು ಗುಣಮಟ್ಟ:** **${aqi} (${cat})**\n- **ಶಿಫಾರಸು:** ಯಾವುದೇ ಆತಂಕವಿಲ್ಲದೆ ಹೊರಾಂಗಣ ವ್ಯಾಯಾಮ ಮತ್ತು ಓಟ ಮುಂದುವರಿಸಬಹುದು. ವಾತಾವರಣ ಅನುಕೂಲಕರವಾಗಿದೆ.\n- **ಉತ್ತಮ ಸಮಯ:** ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ.\n- **ಟಿಪ್:** ಹಸಿರು ಉದ್ಯಾನವನಗಳಲ್ಲಿ ಓಡುವುದರಿಂದ ಧೂಳಿನ ಸಂಪರ್ಕ ಮತ್ತಷ್ಟು ಕಡಿಮೆಯಾಗುತ್ತದೆ.`
        : `### ಹೊರಾಂಗಣ ವ್ಯಾಯಾಮ ಸಲಹೆ: ಎಚ್ಚರಿಕೆ ವಹಿಸಿ\n\n- **ಪ್ರಸ್ತುತ ವಾಯು ಗುಣಮಟ್ಟ:** **${aqi} (${cat})** - ಪ್ರಮುಖ ಮಾಲಿನ್ಯಕಾರಕ **${dominant}** (${pm25} µg/m³).\n- **ಶಿಫಾರಸು:** ತೀವ್ರವಾದ ಹೊರಾಂಗಣ ಓಟವನ್ನು ತಪ್ಪಿಸಿ ಒಳಾಂಗಣ ವ್ಯಾಯಾಮ ಅಥವಾ ಜಿಮ್ ತಾಲೀಮು ಆರಿಸಿ.\n- **ರಕ್ಷಣೆ:** ರಸ್ತೆಯ ಬಳಿ ಓಡಬೇಕಾದರೆ ಪ್ರಮಾಣೀಕೃತ **N95 ಮಾಸ್ಕ್** ಧರಿಸಿ.`;
    }
    if (lang === 'hi') {
      return aqi <= 100
        ? `### आउटडोर व्यायाम सलाह: दौड़ने के लिए सुरक्षित\n\n- **वर्तमान वायु गुणवत्ता:** **${aqi} (${cat})**\n- **सिफारिश:** आप बिना किसी चिंता के बाहर दौड़ने या कसरत करने जा सकते हैं।\n- **सर्वोत्तम समय:** दोपहर या शाम का समय।\n- **टिप:** पार्कों में दौड़ने से पार्टिकुलेट एक्सपोज़र कम होता है।`
        : `### आउटडोर व्यायाम सलाह: सावधानी बरतें\n\n- **वर्तमान वायु गुणवत्ता:** **${aqi} (${cat})** - प्रमुख प्रदूषक **${dominant}** (${pm25} µg/m³)।\n- **सिफारिश:** बाहर तेज दौड़ने और भारी व्यायाम से बचें। इनडोर ट्रेडमिल या योगाभ्यास करें।\n- **सुरक्षा:** यदि बाहर निकलना आवश्यक हो तो **N95 रेस्पिरेटर** पहनें।`;
    }
    if (lang === 'ta') {
      return `### வெளிப்புற உடற்பயிற்சி ஆலோசனை: ஓட்டம் எச்சரிக்கை\n\n- **காற்றுத் தரம்:** **${aqi} (${cat})**\n- **பரிந்துரை:** அதிக மாசு உள்ள நேரங்களில் வெளிப்புற ஓட்டத்தைத் தவிர்த்து உள்அரங்கு உடற்பயிற்சிகளை மேற்கொள்ளவும்.\n- **பாதுகாப்பு:** வெளியே செல்லும்போது **N95 முகக்கவசம்** அணியவும்.`;
    }
    if (lang === 'bn') {
      return `### বহিরঙ্গন ব্যায়াম নির্দেশিকা: দৌড়ানোর সতর্কতা\n\n- **বর্তমান বায়ু মান:** **${aqi} (${cat})**\n- **পরামর্শ:** অতিরিক্ত দূষণের সময় বাইরে দৌড়ানো বা ব্যায়াম এড়িয়ে ঘরের ভেতরে থাকুন।\n- **সুরক্ষা:** বাইরে বের হলে **N95 মাস্ক** ব্যবহার করুন।`;
    }
    if (lang === 'mr') {
      return `### मैदानी व्यायाम सल्ला: धावणे आणि खबरदारी\n\n- **सध्याची हवा गुणवत्ता:** **${aqi} (${cat})**\n- **शिफारस:** जास्त प्रदूषणाच्या वेळी बाहेर धावणे आणि तीव्र व्यायाम टाळा.\n- **संरक्षण:** घराबाहेर पडताना **N95 मास्क** वापरा.`;
    }
    // English default
    if (aqi <= 100) {
      return `### Outdoor Exercise Advisory: Safe to Run\n\n- **Current Air Quality:** **${aqi} (${cat})**\n- **Recommendation:** You can proceed with outdoor workouts without concern. Atmospheric dispersion is favorable.\n- **Best Window:** Morning or late afternoon.\n- **Sustainability Tip:** Jogging in green parks or tree-lined avenues lowers your immediate particulate exposure even further.`;
    } else if (aqi <= 200) {
      return `### Outdoor Exercise Advisory: Exercise Caution\n\n- **Current Air Quality:** **${aqi} (${cat})** with **${dominant}** at **${pm25} µg/m³**.\n- **Recommendation:** Light-to-moderate outdoor activities are permissible for healthy individuals. If you are sensitive, asthmatic, or feel throat tickles, move your workout indoors.\n- **Timing:** Early afternoon (1:00 PM – 4:00 PM) typically has better solar mixing than early morning or late night.\n- **Protection:** Avoid running along congested arterial roadways.`;
    } else {
      return `### Outdoor Exercise Advisory: Move Indoors Immediately\n\n- **Current Air Quality:** **${aqi} (${cat})** - Unhealthy Levels.\n- **Recommendation:** Strictly avoid vigorous outdoor cardio. High breathing volume will draw elevated ${dominant} deep into alveolar lung tissues.\n- **Alternative:** Indoor treadmill, yoga, bodyweight training, or gym workouts with HEPA air filtration.\n- **Commute:** If you must step outside, wear a well-fitted certified **N95/FFP2 respirator**.`;
    }
  }

  // Question 2: Commuting advice
  if (cleanQ.includes('commute') || cleanQ.includes('travel') || cleanQ.includes('metro') || cleanQ.includes('bus') || cleanQ.includes('bike') || cleanQ.includes('ಪ್ರಯಾಣ') || cleanQ.includes('यात्रा') || cleanQ.includes('பயணம்') || cleanQ.includes('যাতায়াত')) {
    if (lang === 'kn') {
      return `### ಪ್ರಯಾಣ ಮತ್ತು ಮಾಲಿನ್ಯ ರಕ್ಷಣಾ ಯೋಜನೆ\n\n- **ಪ್ರಸ್ತುತ AQI:** **${aqi} (${cat})**\n- **ಶಿಫಾರಸು:** ಹವಾನಿಯಂತ್ರಿತ ಮೆಟ್ರೋ ಅಥವಾ ಎಲೆಕ್ಟ್ರಿಕ್ ಬಸ್‌ಗಳನ್ನು ಬಳಸಿ. ಮುಕ್ತ ವಾಹನಗಳಿಗಿಂತ ಮೆಟ್ರೋ ಗಾಳಿಯನ್ನು ಹೆಚ್ಚು ಶುದ್ಧೀಕರಿಸುತ್ತದೆ.\n- **ಪರಿಸರ ಕ್ರಮ:** ಪೆಟ್ರೋಲ್ ಕಾರಿನ ಬದಲಿಗೆ ಮೆಟ್ರೋ ಬಳಸುವುದರಿಂದ ಪ್ರತಿ 10 ಕಿ.ಮೀಗೆ ಸುಮಾರು **1.8 ಕೆಜಿ CO2** ಉಳಿತಾಯವಾಗುತ್ತದೆ!`;
    }
    if (lang === 'hi') {
      return `### यात्रा एवं प्रदूषण सुरक्षा योजना\n\n- **वर्तमान AQI:** **${aqi} (${cat})**\n- **सिफारिश:** जब भी संभव हो इलेक्ट्रिक पब्लिक ट्रांसपोर्ट या वातानुकूलित मेट्रो का उपयोग करें।\n- **हरित कदम:** अकेले पेट्रोल कार के बजाय मेट्रो से यात्रा करने पर प्रति 10 किमी लगभग **1.8 किग्रा CO2e** की बचत होती है!`;
    }
    return `### Commute & Exposure Protection Plan\n\n- **Current AQI:** **${aqi} (${cat})**\n- **Commute Mode Advice:** Use electric public transit or air-conditioned Metro lines whenever possible. Metro cabins filter recirculated air significantly better than open three-wheelers or two-wheelers.\n- **Active Travel:** If cycling or walking along traffic corridors today, wear an **N95 mask** to filter out combustion particles and road brake dust.\n- **Eco-Action:** Switching from single-occupancy petrol cars to metro saves approx **1.8 kg CO2e** per 10 km journey!`;
  }

  // Question 3: Children, school, and elderly precautions
  if (cleanQ.includes('child') || cleanQ.includes('kid') || cleanQ.includes('school') || cleanQ.includes('elderly') || cleanQ.includes('ಮಕ್ಕಳು') || cleanQ.includes('बच्चे') || cleanQ.includes('குழந்தைகள்') || cleanQ.includes('শিশু')) {
    if (lang === 'kn') {
      return `### ಮಕ್ಕಳು ಮತ್ತು ಹಿರಿಯರಿಗೆ ಆರೋಗ್ಯ ರಕ್ಷಣೆ\n\n- **ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ:** **${aqi} (${cat})**\n- **ಮುಖ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು:**\n  1. ಮಾಲಿನ್ಯ ಹೆಚ್ಚಿರುವಾಗ (>200 AQI) ಹೊರಾಂಗಣ ಕ್ರೀಡೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಿ.\n  2. ಮುಂಜಾನೆಯ ಶೀತ ಗಾಳಿಯ ಸಮಯದಲ್ಲಿ ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿಡಿ.\n  3. ಆಸ್ತಮಾ ಇರುವ ಮಕ್ಕಳಿಗೆ ಇನ್ಹೇಲರ್‌ಗಳು ಲಭ್ಯವಿರಲಿ.\n\n*ಸೂಚನೆ: ವೈಯಕ್ತಿಕ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಮಕ್ಕಳ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.*`;
    }
    if (lang === 'hi') {
      return `### बच्चों और बुजुर्गों के लिए स्वास्थ्य सुरक्षा\n\n- **वर्तमान स्थिति:** **${aqi} (${cat})**\n- **प्रमुख सावधानियां:**\n  1. उच्च प्रदूषण के समय (>200 AQI) बाहरी खेल गतिविधियों को सीमित करें।\n  2. सुबह के समय खिड़कियां बंद रखें ताकि धुंध अंदर न आए।\n  3. अस्थमा से पीड़ित बच्चों के लिए इनहेलर उपलब्ध रखें।\n\n*नोट: व्यक्तिगत चिकित्सकीय सलाह के लिए डॉक्टर से परामर्श करें।*`;
    }
    return `### Health Protection for Children & Vulnerable Groups\n\n- **Current Status:** **${aqi} (${cat})**\n- **Why Children Are More Vulnerable:** Children breathe more air per kilogram of body weight than adults, and their lungs are still developing.\n- **Key Precautions:**\n  1. Restrict outdoor physical education (P.E.) sports during high pollution periods (>200 AQI).\n  2. Ensure classrooms or bedrooms keep windows closed during morning thermal inversion hours.\n  3. Encourage adequate hydration to support mucosal barrier defenses.\n  4. For children with childhood asthma, ensure emergency inhalers are accessible.\n\n*Note: Consult a pediatrician for individual clinical medical advice.*`;
  }

  // Question 4: Causes and factors of pollution
  if (cleanQ.includes('caus') || cleanQ.includes('why') || cleanQ.includes('reason') || cleanQ.includes('factor') || cleanQ.includes('source') || cleanQ.includes('ಕಾರಣ') || cleanQ.includes('कारण') || cleanQ.includes('காரணம்') || cleanQ.includes('কারণ')) {
    if (lang === 'kn') {
      return `### ${location} ಪ್ರದೇಶದ ಮಾಲಿನ್ಯದ ಮುಖ್ಯ ಕಾರಣಗಳು\n\n- **ಪ್ರಮುಖ ಮಾಲಿನ್ಯಕಾರಕ:** **${dominant}** (ಉಪ-ಸೂಚ್ಯಂಕ: ${env?.dominantSubIndex || aqi})\n- **ಮುಖ್ಯ ಕಾರಣಗಳು:**\n  1. **ವಾಹನಗಳ ಹೊಗೆ:** ಡೀಸೆಲ್ ಸರಕು ಸಾಗಣೆ ಮತ್ತು ನಿಧಾನಗತಿಯ ಟ್ರಾಫಿಕ್‌ನಿಂದ ಹೊಗೆ.\n  2. **ರಸ್ತೆ ಧೂಳು:** ಪಾದಚಾರಿ ಮಾರ್ಗಗಳಿಲ್ಲದ ರಸ್ತೆಗಳಲ್ಲಿ ವಾಹನ ಚಲನೆಯಿಂದ ಹರಡುವ ಧೂಳು.\n  3. **ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ:** ಮುಂಜಾನೆಯ ಉಷ್ಣ ಹಿಮ್ಮುಖತೆಯು (thermal inversion) ನೆಲಮಟ್ಟದಲ್ಲಿ ಹೊಗೆಯನ್ನು ಹಿಡಿದಿಡುತ್ತದೆ.\n  4. **ತ್ಯಾಜ್ಯ ಸುಡುವಿಕೆ:** ಬಯಲಿನಲ್ಲಿ ಕಸ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ಸುಡುವುದರಿಂದ ಹೊರಹೊಮ್ಮುವ ಹೊಗೆ.`;
    }
    if (lang === 'hi') {
      return `### ${location} में प्रदूषण के प्रमुख कारण\n\n- **प्रमुख प्रदूषक:** **${dominant}** (उप-सूचकांक: ${env?.dominantSubIndex || aqi})\n- **योगदान देने वाले कारक:**\n  1. **वाहनों का उत्सर्जन:** डीजल वाहनों और भारी ट्रैफिक से निकलने वाला धुआं।\n  2. **सड़क की धूल:** अनपक्की सड़कों से उड़ने वाली महीन धूल।\n  3. **थर्मल इन्वर्जन:** सुबह के समय ठंडी हवा जमीन के पास प्रदूषण को रोक कर रखती है।\n  4. **खुले में कचरा जलाना:** कचरा और प्लास्टिक जलाने से निकलने वाले जहरीले कण।`;
    }
    return `### Atmospheric & Emission Breakdown for ${location}\n\n- **Dominant Pollutant:** **${dominant}** (Sub-index: ${env?.dominantSubIndex || aqi})\n- **Key Contributing Sources:**\n  1. **Vehicular Emissions:** Tailpipe exhaust from diesel freight and stop-and-go urban traffic.\n  2. **Suspended Road Dust:** Mechanically kicked up by heavy vehicular movement on unpaved shoulders.\n  3. **Meteorological Inversion:** Low nocturnal boundary layer height traps ground-level emissions near the surface.\n  4. **Biomass & Waste Burning:** Localized open burning of garden clippings or municipal solid waste.`;
  }

  // Question 5: PM2.5 increase / spike precautions
  if (cleanQ.includes('pm2.5') || cleanQ.includes('pm25') || cleanQ.includes('spike') || cleanQ.includes('increase')) {
    return `### Action Plan for Elevated PM2.5 (${pm25} µg/m³)\n\n- **Particle Hazard:** PM2.5 consists of microscopic particles <= 2.5 µm that penetrate deep into the bloodstream and alveoli.\n- **Immediate Actions:**\n  1. Wear an N95/N99 respirator outdoors; surgical or cloth masks do not effectively filter PM2.5.\n  2. Activate HEPA air purifiers indoors and close doors/windows.\n  3. Refrain from burning incense, candles, or frying food indoors during high external pollution.\n  4. Postpone high-exertion outdoor activities until wind dispersion picks up.`;
  }

  // Question 6: Sustainable alternatives
  if (cleanQ.includes('sustainable') || cleanQ.includes('alternative') || cleanQ.includes('green') || cleanQ.includes('eco')) {
    return `### Sustainable & Low-Emission Urban Actions\n\n- **Mass Transit:** Transitioning daily 15 km trips to metro avoids ~2.1 kg CO2e and removes diesel soot.\n- **Traffic Idling:** Switching engine off at signals > 15 seconds reduces localized intersection pollution by up to 25%.\n- **Active Commuting:** On Good/Satisfactory days, cycling or walking for trips under 3 km eliminates cold-start car emissions.\n- **Green Barriers:** Plant indoor sansevieria and spider plants to augment air quality, and advocate for roadside dust misting.`;
  }

  // Question 7: Masks and respirators
  if (cleanQ.includes('mask') || cleanQ.includes('respirator') || cleanQ.includes('n95') || cleanQ.includes('ಮಾಸ್ಕ್') || cleanQ.includes('मास्क') || cleanQ.includes('முகக்கவசம்')) {
    return `### Mask & Personal Protection Guidance\n\n- **Recommended Standard:** Certified **N95 (NIOSH)**, **FFP2 (EN149)**, or **IS 9473** respirators.\n- **Cloth / Surgical Masks:** Ineffective for fine combustion aerosols and PM2.5 due to loose perimeter seal and pore size.\n- **Fit Importance:** Ensure an airtight seal over the nose bridge and chin; facial hair can degrade filtration efficiency.\n- **Lifespan:** Replace masks after 40–50 hours of active wear or whenever breathing resistance increases significantly.`;
  }

  // Question 8: Air purifiers and HEPA filtration
  if (cleanQ.includes('purifier') || cleanQ.includes('hepa') || cleanQ.includes('filter') || cleanQ.includes('indoor')) {
    return `### Indoor Air Purification Guidance\n\n- **True HEPA (H13/H14):** Traps 99.97% of particles down to 0.3 microns, including PM2.5 and allergen dust.\n- **Activated Carbon Stage:** Essential for absorbing volatile organic compounds (VOCs), SO2, and NO2.\n- **Sizing:** Choose an air purifier with a Clean Air Delivery Rate (CADR) sufficient for 4 to 5 air changes per hour (ACH) in your room volume.\n- **Placement:** Keep purifiers at least 1 meter away from walls and avoid placing near open doors.`;
  }

  // Question 9: Ventilation and window opening
  if (cleanQ.includes('window') || cleanQ.includes('ventilat') || cleanQ.includes('air out')) {
    return `### Ventilation & Indoor Air Exchange Strategy\n\n- **Best Window Window:** Early to mid-afternoon (1:30 PM – 4:30 PM) when atmospheric mixing layer height is maximum.\n- **Hours to Avoid:** 6:00 AM – 10:00 AM and 7:00 PM – 11:00 PM due to boundary-layer nocturnal inversion and traffic congestion.\n- **Cross Ventilation:** Open opposite windows for 10–15 minutes during cleaner hours, then reseal and run HEPA filtration.`;
  }

  // Question 10: General environmental summary
  if (lang === 'kn') {
    return `### ಏರ್‌ವೈಸ್ ಪರಿಸರ ಸಾರಾಂಶ\n\n- **ಸ್ಥಳ:** ${location}\n- **ಭಾರತೀಯ AQI:** **${aqi}** — **${cat}**\n- **ಪ್ರಮುಖ ಮಾಲಿನ್ಯಕಾರಕ:** **${dominant}** (${pm25} µg/m³)\n\n**ತಕ್ಷಣದ ಶಿಫಾರಸುಗಳು:**\n1. ಬೆಳಗಿನ ದಟ್ಟಣೆಯ ಸಮಯದಲ್ಲಿ ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿಡಿ.\n2. ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳಿಗೆ ಮಧ್ಯಾಹ್ನದ ಶುದ್ಧ ಸಮಯವನ್ನು ಬಳಸಿ.\n3. ವೈಯಕ್ತಿಕ ವಾಹನಗಳ ಬದಲಿಗೆ ಮೆಟ್ರೋ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆಯನ್ನು ಆರಿಸಿ.`;
  }
  if (lang === 'hi') {
    return `### एयरवाइज़ पर्यावरण सारांश\n\n- **स्थान:** ${location}\n- **भारतीय AQI:** **${aqi}** — **${cat}**\n- **प्रमुख प्रदूषक:** **${dominant}** (${pm25} µg/m³)\n\n**तात्कालिक सिफारिशें:**\n1. सुबह के समय खिड़कियां बंद रखें।\n2. संवेदनशील लोग बाहरी भारी व्यायाम सीमित करें।\n3. वायु प्रदूषण कम करने के लिए सार्वजनिक परिवहन का उपयोग करें।`;
  }
  if (lang === 'ta') {
    return `### ஏர்வைஸ் சுற்றுச்சூழல் சுருக்கம்\n\n- **இடம்:** ${location}\n- **இந்திய AQI:** **${aqi}** — **${cat}**\n- **முக்கிய மாசுபடுத்தி:** **${dominant}** (${pm25} µg/m³)\n\n**உடனடி பரிந்துரைகள்:**\n1. காலை நெரிசல் நேரங்களில் ஜன்னல்களை மூடி வைக்கவும்.\n2. உடற்பயிற்சிக்கு தூய மதிய நேரத்தைப் பயன்படுத்தவும்.`;
  }
  if (lang === 'bn') {
    return `### এয়ারওয়াইজ পরিবেশগত সারসংক্ষেপ\n\n- **অবস্থান:** ${location}\n- **ভারতীয় AQI:** **${aqi}** — **${cat}**\n- **প্রধান দূষণকারী:** **${dominant}** (${pm25} µg/m³)\n\n**তাৎক্ষণিক পরামর্শ:**\n1. সকালের ব্যস্ত সময়ে জানালা বন্ধ রাখুন।\n2. ব্যায়ামের জন্য পরিচ্ছন্ন সময় বেছে নিন।`;
  }
  if (lang === 'mr') {
    return `### एअरवाइझ पर्यावरण सारांश\n\n- **स्थान:** ${location}\n- **भारतीय AQI:** **${aqi}** — **${cat}**\n- **प्रमुख प्रदूषक:** **${dominant}** (${pm25} µg/m³)\n\n**तातडीच्या शिफारसी:**\n1. सकाळी खिडक्या बंद ठेवा.\n2. संवेदनशील व्यक्तींनी मैदानी व्यायाम मर्यादित ठेवावा.`;
  }

  return `### AirWise Environmental Intelligence Summary\n\n- **Location:** ${location}\n- **Indian AQI:** **${aqi}** — **${cat}**\n- **Dominant Stressor:** **${dominant}** at **${pm25} µg/m³**\n\n**Immediate Recommendations:**\n1. **Ventilation:** Best to keep windows closed during early morning rush hours.\n2. **Outdoor Activity:** ${cat === 'Good' || cat === 'Satisfactory' ? 'Safe for all normal routines.' : 'Moderate or sensitive individuals should take frequent breaks and avoid high-traffic corridors.'}\n3. **Sustainable Action:** Choose electric bus or metro for your next journey to curb ambient urban emissions.`;
}
