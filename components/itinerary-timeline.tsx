import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  type: "travel" | "consult" | "procedure" | "recovery" | "sightseeing" | "departure";
}

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <div className="itinerary-days relative ml-auto max-w-[760px] border-l-2 border-border pl-8 sm:pl-12">
      <Plane aria-hidden="true" className="sticky -ml-[45px] top-[45vh] z-10 -mt-1 mb-2 h-6 w-6 rotate-45 text-primary" />
      {days.map((day) => {
        const tone = day.type === "procedure" ? "text-[hsl(20_60%_45%)]" : day.type === "consult" ? "text-[hsl(84_40%_42%)]" : day.type === "recovery" ? "text-[hsl(85_12%_55%)]" : day.type === "departure" ? "text-foreground" : "text-primary";
        return (
          <div key={day.day} className="relative grid grid-cols-[72px_1fr] gap-4 border-b border-border py-7 last:border-0 sm:grid-cols-[94px_1fr]">
            <span className="absolute -left-[39px] top-9 h-3 w-3 rounded-full border-2 border-background bg-border sm:-left-[55px]" aria-hidden="true" />
            <div>
              <p className={cn("text-sm font-extrabold",tone)}>
                Day {day.day}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-extrabold leading-tight">{day.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
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
    description: `Transfer to your hotel near ${providerName}, settle in, and rest.`,
    type: "travel",
  });

  days.push({
    day: dayNum++,
    title: "Initial Consultation",
    description: `Meet your care team, review the plan for ${procedures.slice(0, 2).join(" & ")}, and complete assessments.`,
    type: "consult",
  });

  days.push({
    day: dayNum++,
    title: "Procedure Day",
    description: `Your care team guides the scheduled treatment and explains aftercare.`,
    type: "procedure",
  });

  const recoveryCount = Math.max(1, Math.min(recoveryDays, 5));
  for (let i = 0; i < recoveryCount; i++) {
    days.push({
      day: dayNum++,
      title: i === 0 ? "Rest & Recovery" : `Recovery Day ${i + 1}`,
      description:
        i === 0
          ? `Rest at your hotel and follow the care team's post-procedure instructions.`
          : i === recoveryCount - 1
            ? `Attend a final check-up and review follow-up guidance with your care team.`
            : `Continue to rest, hydrate, and follow your medication schedule.`,
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
      description: `Keep the day flexible for nearby sights, markets, and local food.`,
      type: "sightseeing",
    });
  }

  days.push({
    day: dayNum,
    title: "Departure",
    description: `Travel to the airport with your care documents and follow-up instructions.`,
    type: "departure",
  });

  return days;
}

function getSightseeingDescription(city: string, country: string): string {
  const sightseeing: Record<string, string> = {
    Bangkok:
      "The Grand Palace, Chatuchak Market, or the floating markets.",
    Phuket:
      "Patong Beach, the Big Buddha, or a sunset cruise around Phang Nga Bay.",
    Istanbul:
      "Hagia Sophia, the Blue Mosque, or the Grand Bazaar.",
    Antalya:
      "Kaleiçi Old Town, Düden Waterfalls, or Konyaaltı Beach.",
    Ankara:
      "Anıtkabir, the Museum of Anatolian Civilizations, or the Citadel.",
    Cancun:
      "Chichén Itzá, Isla Mujeres, or the Caribbean beaches.",
    Tijuana:
      "The Tijuana Cultural Center, Avenida Revolución, or Valle de Guadalupe.",
    Monterrey:
      "Fundidora Park, MARCO, or views of Cerro de la Silla.",
    Guadalajara:
      "The historic center, Hospicio Cabañas, or Tlaquepaque.",
  };
  return (
    sightseeing[city] ||
    `Local landmarks and regional food in ${city}, ${country}.`
  );
}
