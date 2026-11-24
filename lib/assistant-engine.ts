/**
 * Rule-based environmental intelligence engine for AirWise Assistant
 */

export function generateRuleBasedResponse(
  query: string,
  env: any,
  profile: any
): string {
  // Normalize typographic curly apostrophes and punctuation
  const cleanQ = query.replace(/[’‘]/g, "'").toLowerCase();

  const aqi = env?.aqi ?? env?.indicativeAqi ?? 160;
  const cat = env?.category || 'Moderate';
  const dominant = env?.dominantPollutant?.toUpperCase() || 'PM2.5';
  const pm25 = env?.pm25 ?? 75;

  // Question 1: Running and outdoor workouts
  if (cleanQ.includes('running') || cleanQ.includes('exercise') || cleanQ.includes('jog') || cleanQ.includes('workout')) {
    if (aqi <= 100) {
      return `### Outdoor Exercise Advisory: Safe to Run\n\n- **Current Air Quality:** **${aqi} (${cat})**\n- **Recommendation:** You can proceed with outdoor workouts without concern. Atmospheric dispersion is favorable.\n- **Best Window:** Morning or late afternoon.\n- **Sustainability Tip:** Jogging in green parks or tree-lined avenues lowers your immediate particulate exposure even further.`;
    } else if (aqi <= 200) {
      return `### Outdoor Exercise Advisory: Exercise Caution\n\n- **Current Air Quality:** **${aqi} (${cat})** with **${dominant}** at **${pm25} µg/m³**.\n- **Recommendation:** Light-to-moderate outdoor activities are permissible for healthy individuals. If you are sensitive, asthmatic, or feel throat tickles, move your workout indoors.\n- **Timing:** Early afternoon (1:00 PM – 4:00 PM) typically has better solar mixing than early morning or late night.\n- **Protection:** Avoid running along congested arterial roadways.`;
    } else {
      return `### Outdoor Exercise Advisory: Move Indoors Immediately\n\n- **Current Air Quality:** **${aqi} (${cat})** - Unhealthy Levels.\n- **Recommendation:** Strictly avoid vigorous outdoor cardio. High breathing volume will draw elevated ${dominant} deep into alveolar lung tissues.\n- **Alternative:** Indoor treadmill, yoga, bodyweight training, or gym workouts with HEPA air filtration.\n- **Commute:** If you must step outside, wear a well-fitted certified **N95/FFP2 respirator**.`;
    }
  }

  // Question 2: Commuting advice
  if (cleanQ.includes('commute') || cleanQ.includes('travel') || cleanQ.includes('metro') || cleanQ.includes('bus') || cleanQ.includes('bike')) {
    return `### Commute & Exposure Protection Plan\n\n- **Current AQI:** **${aqi} (${cat})**\n- **Commute Mode Advice:** Use electric public transit or air-conditioned Metro lines whenever possible. Metro cabins filter recirculated air significantly better than open three-wheelers or two-wheelers.\n- **Active Travel:** If cycling or walking along traffic corridors today, wear an **N95 mask** to filter out combustion particles and road brake dust.\n- **Eco-Action:** Switching from single-occupancy petrol cars to metro saves approx **1.8 kg CO2e** per 10 km journey!`;
  }

  // Question 3: Children, school, and elderly precautions
  if (cleanQ.includes('child') || cleanQ.includes('kid') || cleanQ.includes('school') || cleanQ.includes('elderly')) {
    return `### Health Protection for Children & Vulnerable Groups\n\n- **Current Status:** **${aqi} (${cat})**\n- **Why Children Are More Vulnerable:** Children breathe more air per kilogram of body weight than adults, and their lungs are still developing.\n- **Key Precautions:**\n  1. Restrict outdoor physical education (P.E.) sports during high pollution periods (>200 AQI).\n  2. Ensure classrooms or bedrooms keep windows closed during morning thermal inversion hours.\n  3. Encourage adequate hydration to support mucosal barrier defenses.\n  4. For children with childhood asthma, ensure emergency inhalers are accessible.\n\n*Note: Consult a pediatrician for individual clinical medical advice.*`;
  }

  // Question 4: Causes and factors of pollution
  if (cleanQ.includes('caus') || cleanQ.includes('why') || cleanQ.includes('reason') || cleanQ.includes('factor') || cleanQ.includes('source')) {
    return `### Atmospheric & Emission Breakdown for ${env?.locationName || 'Region'}\n\n- **Dominant Pollutant:** **${dominant}** (Sub-index: ${env?.dominantSubIndex || aqi})\n- **Key Contributing Sources:**\n  1. **Vehicular Emissions:** Tailpipe exhaust from diesel freight and stop-and-go urban traffic.\n  2. **Suspended Road Dust:** Mechanically kicked up by heavy vehicular movement on unpaved shoulders.\n  3. **Meteorological Inversion:** Low nocturnal boundary layer height traps ground-level emissions near the surface.\n  4. **Biomass & Waste Burning:** Localized open burning of garden clippings or municipal solid waste.`;
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
  if (cleanQ.includes('mask') || cleanQ.includes('respirator') || cleanQ.includes('n95')) {
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
  return `### AirWise Environmental Intelligence Summary\n\n- **Location:** ${env?.locationName || 'Selected City'}\n- **Indian AQI:** **${aqi}** — **${cat}**\n- **Dominant Stressor:** **${dominant}** at **${pm25} µg/m³**\n\n**Immediate Recommendations:**\n1. **Ventilation:** Best to keep windows closed during early morning rush hours.\n2. **Outdoor Activity:** ${cat === 'Good' || cat === 'Satisfactory' ? 'Safe for all normal routines.' : 'Moderate or sensitive individuals should take frequent breaks and avoid high-traffic corridors.'}\n3. **Sustainable Action:** Choose electric bus or metro for your next journey to curb ambient urban emissions.`;
}
