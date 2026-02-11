import React from "react"
import { cn } from "@/lib/utils";
import {
  Plane,
  Stethoscope,
  Syringe,
  BedDouble,
  Palmtree,
  Building2,
  ArrowRight,
} from "lucide-react";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  type: "travel" | "consult" | "procedure" | "recovery" | "sightseeing" | "departure";
}

const typeConfig: Record<
  ItineraryDay["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  travel: { icon: Plane, color: "text-primary", bg: "bg-primary/10" },
  consult: { icon: Stethoscope, color: "text-chart-2", bg: "bg-accent/10" },
  procedure: { icon: Syringe, color: "text-destructive", bg: "bg-destructive/10" },
  recovery: { icon: BedDouble, color: "text-muted-foreground", bg: "bg-muted" },
  sightseeing: { icon: Palmtree, color: "text-primary", bg: "bg-primary/10" },
  departure: { icon: ArrowRight, color: "text-foreground", bg: "bg-secondary" },
};

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <div className="relative space-y-0">
      {days.map((day, index) => {
        const config = typeConfig[day.type];
        const Icon = config.icon;
        return (
          <div key={day.day} className="flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  config.bg
                )}
              >
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              {index < days.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>
            <div className="pt-1 pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Day {day.day}
              </p>
              <h3 className="font-semibold text-foreground">{day.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {day.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function generateItinerary(
  providerName: string,
  city: string,
  country: string,
  recoveryDays: number,
  procedures: string[]
): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  let dayNum = 1;

  days.push({
    day: dayNum++,
    title: `Arrive in ${city}`,
    description: `Arrive at ${city} airport. Transfer to your hotel near ${providerName}. Rest and settle in. Explore the neighborhood and enjoy a welcome dinner.`,
    type: "travel",
  });

  days.push({
    day: dayNum++,
    title: "Initial Consultation",
    description: `Visit ${providerName} for your initial consultation. Meet your care team, complete pre-procedure assessments, and review your treatment plan for ${procedures.slice(0, 2).join(" & ")}.`,
    type: "consult",
  });

  days.push({
    day: dayNum++,
    title: "Procedure Day",
    description: `Your scheduled procedure at ${providerName}. Your care team will guide you through every step. Post-procedure instructions and medications will be provided.`,
    type: "procedure",
  });

  const recoveryCount = Math.max(1, Math.min(recoveryDays, 5));
  for (let i = 0; i < recoveryCount; i++) {
    days.push({
      day: dayNum++,
      title: i === 0 ? "Rest & Recovery" : `Recovery Day ${i + 1}`,
      description:
        i === 0
          ? `Rest at your hotel. Follow post-procedure care instructions. ${providerName} staff available for check-in calls. Light meals recommended.`
          : i === recoveryCount - 1
            ? `Final recovery check-up at ${providerName}. Your care team will assess your progress and provide clearance for light activities.`
            : `Continue resting and recovering. Stay hydrated and follow your medication schedule. Short walks around the hotel are encouraged if comfortable.`,
      type: "recovery",
    });
  }

  days.push({
    day: dayNum++,
    title: `Explore ${city}`,
    description: getSightseeingDescription(city, country),
    type: "sightseeing",
  });

  if (dayNum <= 9) {
    days.push({
      day: dayNum++,
      title: "Free Day & Shopping",
      description: `Enjoy a relaxed day in ${city}. Visit local markets, pick up souvenirs, or enjoy a spa day. Try local cuisine at recommended restaurants near your hotel.`,
      type: "sightseeing",
    });
  }

  days.push({
    day: dayNum,
    title: "Departure",
    description: `Final check-up if needed. Pack up and transfer to the airport. Your ${providerName} team will provide post-care documentation and follow-up instructions for your home doctor.`,
    type: "departure",
  });

  return days;
}

function getSightseeingDescription(city: string, country: string): string {
  const sightseeing: Record<string, string> = {
    Bangkok:
      "Visit the Grand Palace, explore Chatuchak Market, or take a boat ride through the floating markets. Enjoy world-class Thai cuisine at local restaurants.",
    Phuket:
      "Relax at Patong Beach, visit the Big Buddha, or take a sunset cruise around Phang Nga Bay. Enjoy fresh seafood at a beachside restaurant.",
    Istanbul:
      "Explore the Hagia Sophia, Blue Mosque, and Grand Bazaar. Take a Bosphorus cruise for stunning views of the city skyline.",
    Antalya:
      "Visit the Old Town (Kaleici), explore Duden Waterfalls, or relax at Konyaalti Beach. Enjoy fresh Turkish cuisine at seaside restaurants.",
    Ankara:
      "Visit Ataturk's Mausoleum, explore the Museum of Anatolian Civilizations, and stroll through the historic Citadel area.",
    Cancun:
      "Visit the Mayan ruins of Chichen Itza, snorkel at Isla Mujeres, or relax at the beautiful Caribbean beaches.",
    Tijuana:
      "Explore the Tijuana Cultural Center, visit local taco stands on Avenida Revolucion, or take a day trip to Valle de Guadalupe wine country.",
    Monterrey:
      "Visit Fundidora Park, explore the MARCO museum, or take a cable car ride to Cerro de la Silla for panoramic views.",
    Guadalajara:
      "Visit the historic center and Hospicio Cabanas, explore Tlaquepaque art village, or sample tequila in the birthplace of the spirit.",
  };
  return (
    sightseeing[city] ||
    `Explore the sights of ${city}, ${country}. Visit local landmarks, try regional cuisine, and soak in the culture.`
  );
}
