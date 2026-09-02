/**
 * Safety Layer Module
 * Enforces medical safety rules before generating response:
 * - Prevents definitive medical diagnosis
 * - Identifies emergency red flags (e.g. severe pain + fainting, chest pain, high fever + stiff neck, heavy hemorrhaging)
 * - Prioritizes immediate professional emergency care over long explanations for critical cases
 * - Appends clear disclaimers distinguishing general health information from personalized clinical advice
 */

export interface SafetyCheckResult {
  isEmergency: boolean;
  emergencyType?: string;
  hasRedFlags: boolean;
  redFlags: string[];
  safeNextSteps: string[];
  disclaimer: Record<string, string>;
  cautiousPhrasing: string;
}

const RED_FLAG_PATTERNS = [
  { pattern: /faint|syncope|pass(ed)? out|unconscious/, flag: "Fainting or loss of consciousness with abdominal pain", emergency: true },
  { pattern: /severe (abdominal|pelvic|stomach) pain/, flag: "Acute severe abdominal or pelvic pain", emergency: false },
  { pattern: /heavy (bleeding|hemorrhage)|soaking.*pad.*hour/, flag: "Abnormally heavy vaginal bleeding", emergency: true },
  { pattern: /chest pain|shortness of breath|difficulty breathing/, flag: "Chest discomfort or respiratory distress", emergency: true },
  { pattern: /high fever.*stiff neck|103|104/, flag: "High fever exceeding 103°F or severe systemic illness", emergency: true },
  { pattern: /sudden severe headache|thunderclap/, flag: "Sudden neurological headache", emergency: true }
];

export class SafetyLayer {
  public evaluateSafety(prompt: string, symptoms: string[] = [], severity: string = 'LOW'): SafetyCheckResult {
    const text = `${prompt} ${symptoms.join(' ')}`.toLowerCase();
    const redFlags: string[] = [];
    let isEmergency = false;
    let emergencyType: string | undefined = undefined;

    for (const item of RED_FLAG_PATTERNS) {
      if (item.pattern.test(text)) {
        redFlags.push(item.flag);
        if (item.emergency) {
          isEmergency = true;
          emergencyType = item.flag;
        }
      }
    }

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      if (text.includes('faint') || text.includes('severe')) {
        isEmergency = true;
      }
    }

    const safeNextSteps = isEmergency
      ? [
          "Seek IMMEDIATE emergency medical assessment or call 108 / local ambulance.",
          "Do not consume solid food or unprescribed pain medication before clinical evaluation.",
          "Keep an adult companion or family member informed immediately."
        ]
      : [
          "Consult a certified female gynecologist or medical practitioner for clinical evaluation.",
          "Track symptom duration, intensity, and temperature.",
          "Rest adequately and stay hydrated."
        ];

    const disclaimer: Record<string, string> = {
      en: "⚠️ Disclaimer: MahilaCare AI provides evidence-based health guidance for informational purposes. This does not constitute a formal clinical diagnosis or replace a doctor's evaluation.",
      hi: "⚠️ अस्वीकरण: नारीकेयर AI केवल स्वास्थ्य जानकारी प्रदान करता है। यह डॉक्टर के औपचारिक इलाज या नैदानिक जांच का विकल्प नहीं है।",
      pa: "⚠️ ਬੇਦਾਅਵਾ: ਨਾਰੀਕੇਅਰ AI ਸਿਰਫ ਸਿਹਤ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਇਹ ਡਾਕਟਰ ਦੀ ਜਾਂਚ ਦਾ ਵਿਕਲਪ ਨਹੀਂ ਹੈ।",
      bn: "⚠️ দাবিত্যাগ: নারী কেয়ার এআই শুধুমাত্র তথ্যমূলক নির্দেশিকা প্রদান করে, এটি ডাক্তারের পরীক্ষার বিকল্প নয়।",
      ta: "⚠️ மறுப்பு: நாரிகேர் AI வழிகாட்டுதலை மட்டுமே வழங்குகிறது. இது மருத்துவ ஆலோசனையன்று.",
      te: "⚠️ గమనిక: నారీకేర్ AI వైద్య మార్గదర్శకత్వం మాత్రమే ఇస్తుంది. ఇది డాక్టర్ సలహాకు ప్రత్యామ్నాయం కాదు.",
      kn: "⚠️ ಹಕ್ಕುತ್ಯಾಗ: ನಾರಿಕೇರ್ AI ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ, ಇದು ವೈದ್ಯರ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
      ml: "⚠️ നിരാകരണം: നാരിെയർ AI മാർഗ്ഗനിർദ്ദേശം നൽകുന്നു, ഇത് ഡോക്ടറുടെ ഉപദേശത്തിന് പകരമല്ല.",
      gu: "⚠️ અસ્વીકરણ: નારીકેર AI માર્ગદર્શન પૂરું પાડે છે, તે ડૉક્ટરની સલાહનો વિકલ્પ નથી.",
      mr: "⚠️ अस्वीकरण: नारीकेअर AI फक्त मार्गदर्शन प्रदान करते, ही वैद्यकीय सल्ल्याची जागा घेऊ शकत नाही."
    };

    return {
      isEmergency,
      emergencyType,
      hasRedFlags: redFlags.length > 0,
      redFlags,
      safeNextSteps,
      disclaimer,
      cautiousPhrasing: "These symptoms can sometimes require urgent clinical evaluation by a medical professional."
    };
  }
}

export const safetyLayer = new SafetyLayer();
