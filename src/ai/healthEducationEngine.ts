/**
 * Health Education Engine
 * Synthesizes evidence-based medical education on PCOS, Anemia, Maternal Health,
 * Breast/Cervical Health, Government Health Schemes, and Myth Busters.
 */

import type { UserHealthContext } from './conversationMemory.ts';

export interface HealthSourceLink {
  name: string;
  url: string;
  tag: string;
}

export interface HealthEducationOutput {
  topic: string;
  summary: string;
  keyPoints: string[];
  mythBuster?: { myth: string; fact: string };
  governmentSchemes: Array<{ name: string; benefit: string }>;
  trustedSources: HealthSourceLink[];
}

export class HealthEducationEngine {
  public generateEducation(prompt: string, context: UserHealthContext): HealthEducationOutput {
    const p = (prompt || '').toLowerCase();

    const trustedSources: HealthSourceLink[] = [
      { name: 'World Health Organization (WHO)', url: 'https://www.who.int/health-topics/women-s-health', tag: 'Global Clinical Standards' },
      { name: 'MoHFW - Govt of India', url: 'https://mohfw.gov.in/', tag: 'National Schemes & Guidelines' },
      { name: 'National Health Service (NHS UK)', url: 'https://www.nhs.uk/womens-health/', tag: 'Evidence-Based Care' },
      { name: 'CDC Women\'s Health', url: 'https://www.cdc.gov/women/index.htm', tag: 'Disease Prevention' }
    ];

    const governmentSchemes = [
      { name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)", benefit: "Direct financial benefit of ₹5,000 for pregnant & lactating mothers." },
      { name: "Ayushman Bharat (PM-JAY)", benefit: "Up to ₹5 Lakh/year cashless hospitalization for eligible families." },
      { name: "Janani Suraksha Yojana (JSY)", benefit: "Financial assistance for institutional delivery to lower maternal mortality." }
    ];

    let topic = "General Women's Wellness & Preventive Care";
    let summary = "Maintaining optimal physical and hormonal health requires balanced nutrition, regular hydration, and early clinical screening.";
    let keyPoints = [
      "Prioritize iron and folic acid in daily diet to prevent anemia.",
      "Track your menstrual cycle duration to identify hormonal shifts early.",
      "Perform monthly breast self-examinations and schedule pap smears every 3 years after age 21."
    ];

    let mythBuster = {
      myth: "Myth: Rest completely and avoid all movement during period cramps.",
      fact: "Fact: Gentle movement, yoga, and walking release endorphins that alleviate uterine cramping."
    };

    if (p.includes('pcos') || p.includes('pcod')) {
      topic = "PCOS & Hormonal Balance";
      summary = "Polycystic Ovary Syndrome (PCOS) involves hormonal variation, irregular ovulation, and insulin resistance.";
      keyPoints = [
        "Adopt a low glycemic index diet (lentils, oats, green leafy vegetables).",
        "Engage in 30 minutes of daily physical exercise to improve insulin sensitivity.",
        "Consult your gynecologist for periodic ultrasound and HbA1c testing."
      ];
    } else if (p.includes('scheme') || p.includes('yojana') || p.includes('government')) {
      topic = "National Healthcare Schemes for Women in India";
      summary = "The Indian government provides multiple financial and medical support initiatives for female health.";
      keyPoints = [
        "PMMVY provides cash incentives transferred directly to bank accounts.",
        "PM-JAY covers tertiary hospital stay costs up to ₹5 Lakh per family annually."
      ];
    }

    return {
      topic,
      summary,
      keyPoints,
      mythBuster,
      governmentSchemes,
      trustedSources
    };
  }
}

export const healthEducationEngine = new HealthEducationEngine();
