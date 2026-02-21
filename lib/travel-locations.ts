export type TravelAirport = {
  iata: string;
  cityCode: string;
  city: string;
  name: string;
};

export type TravelLocationProfile = {
  country: string;
  recommendedCity: string;
  recommendedCityCode: string;
  aliases: string[];
  airports: TravelAirport[];
};

export const TRAVEL_LOCATION_PROFILES: TravelLocationProfile[] = [
  {
    country: "Thailand",
    recommendedCity: "Bangkok",
    recommendedCityCode: "BKK",
    aliases: ["thailand", "bangkok", "phuket"],
    airports: [
      { iata: "BKK", cityCode: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport" },
      { iata: "DMK", cityCode: "BKK", city: "Bangkok", name: "Don Mueang Airport" },
      { iata: "HKT", cityCode: "HKT", city: "Phuket", name: "Phuket International Airport" },
    ],
  },
  {
    country: "Mexico",
    recommendedCity: "Cancun",
    recommendedCityCode: "CUN",
    aliases: ["mexico", "cancun", "tijuana", "monterrey", "guadalajara"],
    airports: [
      { iata: "CUN", cityCode: "CUN", city: "Cancun", name: "Cancun International Airport" },
      { iata: "TIJ", cityCode: "TIJ", city: "Tijuana", name: "Tijuana International Airport" },
      { iata: "MTY", cityCode: "MTY", city: "Monterrey", name: "Monterrey International Airport" },
      { iata: "GDL", cityCode: "GDL", city: "Guadalajara", name: "Guadalajara International Airport" },
      { iata: "MEX", cityCode: "MEX", city: "Mexico City", name: "Mexico City International Airport" },
    ],
  },
  {
    country: "Turkey",
    recommendedCity: "Istanbul",
    recommendedCityCode: "IST",
    aliases: ["turkey", "istanbul", "antalya", "ankara"],
    airports: [
      { iata: "IST", cityCode: "IST", city: "Istanbul", name: "Istanbul Airport" },
      { iata: "SAW", cityCode: "IST", city: "Istanbul", name: "Sabiha Gokcen Airport" },
      { iata: "AYT", cityCode: "AYT", city: "Antalya", name: "Antalya Airport" },
      { iata: "ESB", cityCode: "ANK", city: "Ankara", name: "Esenboga Airport" },
    ],
  },
  {
    country: "Spain",
    recommendedCity: "Barcelona",
    recommendedCityCode: "BCN",
    aliases: ["spain", "barcelona", "madrid"],
    airports: [
      { iata: "BCN", cityCode: "BCN", city: "Barcelona", name: "Barcelona-El Prat Airport" },
      { iata: "MAD", cityCode: "MAD", city: "Madrid", name: "Adolfo Suarez Madrid-Barajas Airport" },
    ],
  },
  {
    country: "Guatemala",
    recommendedCity: "Guatemala City",
    recommendedCityCode: "GUA",
    aliases: ["guatemala", "guatemala city", "antigua"],
    airports: [
      { iata: "GUA", cityCode: "GUA", city: "Guatemala City", name: "La Aurora International Airport" },
    ],
  },
  {
    country: "South Korea",
    recommendedCity: "Seoul",
    recommendedCityCode: "SEL",
    aliases: ["south korea", "korea", "seoul", "busan"],
    airports: [
      { iata: "ICN", cityCode: "SEL", city: "Seoul", name: "Incheon International Airport" },
      { iata: "GMP", cityCode: "SEL", city: "Seoul", name: "Gimpo International Airport" },
      { iata: "PUS", cityCode: "PUS", city: "Busan", name: "Gimhae International Airport" },
    ],
  },
  {
    country: "Vietnam",
    recommendedCity: "Hanoi",
    recommendedCityCode: "HAN",
    aliases: ["vietnam", "hanoi", "ho chi minh city", "saigon"],
    airports: [
      { iata: "HAN", cityCode: "HAN", city: "Hanoi", name: "Noi Bai International Airport" },
      { iata: "SGN", cityCode: "SGN", city: "Ho Chi Minh City", name: "Tan Son Nhat Airport" },
    ],
  },
  {
    country: "Cuba",
    recommendedCity: "Havana",
    recommendedCityCode: "HAV",
    aliases: ["cuba", "havana"],
    airports: [
      { iata: "HAV", cityCode: "HAV", city: "Havana", name: "Jose Marti International Airport" },
    ],
  },
  {
    country: "Taiwan",
    recommendedCity: "Taipei",
    recommendedCityCode: "TPE",
    aliases: ["taiwan", "taipei", "taichung"],
    airports: [
      { iata: "TPE", cityCode: "TPE", city: "Taipei", name: "Taoyuan International Airport" },
      { iata: "TSA", cityCode: "TPE", city: "Taipei", name: "Taipei Songshan Airport" },
      { iata: "RMQ", cityCode: "RMQ", city: "Taichung", name: "Taichung International Airport" },
    ],
  },
  {
    country: "Sweden",
    recommendedCity: "Stockholm",
    recommendedCityCode: "STO",
    aliases: ["sweden", "stockholm", "gothenburg"],
    airports: [
      { iata: "ARN", cityCode: "STO", city: "Stockholm", name: "Stockholm Arlanda Airport" },
      { iata: "BMA", cityCode: "STO", city: "Stockholm", name: "Stockholm Bromma Airport" },
      { iata: "GOT", cityCode: "GOT", city: "Gothenburg", name: "Gothenburg Landvetter Airport" },
    ],
  },
  {
    country: "Norway",
    recommendedCity: "Oslo",
    recommendedCityCode: "OSL",
    aliases: ["norway", "oslo", "bergen"],
    airports: [
      { iata: "OSL", cityCode: "OSL", city: "Oslo", name: "Oslo Gardermoen Airport" },
      { iata: "BGO", cityCode: "BGO", city: "Bergen", name: "Bergen Airport" },
    ],
  },
  {
    country: "Singapore",
    recommendedCity: "Singapore",
    recommendedCityCode: "SIN",
    aliases: ["singapore"],
    airports: [
      { iata: "SIN", cityCode: "SIN", city: "Singapore", name: "Singapore Changi Airport" },
    ],
  },
  {
    country: "Ireland",
    recommendedCity: "Dublin",
    recommendedCityCode: "DUB",
    aliases: ["ireland", "dublin", "cork"],
    airports: [
      { iata: "DUB", cityCode: "DUB", city: "Dublin", name: "Dublin Airport" },
      { iata: "ORK", cityCode: "ORK", city: "Cork", name: "Cork Airport" },
    ],
  },
  {
    country: "Japan",
    recommendedCity: "Tokyo",
    recommendedCityCode: "TYO",
    aliases: ["japan", "tokyo", "osaka"],
    airports: [
      { iata: "HND", cityCode: "TYO", city: "Tokyo", name: "Haneda Airport" },
      { iata: "NRT", cityCode: "TYO", city: "Tokyo", name: "Narita Airport" },
      { iata: "KIX", cityCode: "OSA", city: "Osaka", name: "Kansai International Airport" },
    ],
  },
  {
    country: "Netherlands",
    recommendedCity: "Amsterdam",
    recommendedCityCode: "AMS",
    aliases: ["netherlands", "amsterdam", "rotterdam", "holland"],
    airports: [
      { iata: "AMS", cityCode: "AMS", city: "Amsterdam", name: "Amsterdam Schiphol Airport" },
      { iata: "RTM", cityCode: "RTM", city: "Rotterdam", name: "Rotterdam The Hague Airport" },
    ],
  },
];

export function findTravelLocation(input: string | null | undefined): TravelLocationProfile | null {
  const query = (input ?? "").trim().toLowerCase();
  if (!query) {
    return null;
  }

  return (
    TRAVEL_LOCATION_PROFILES.find((profile) => {
      if (profile.country.toLowerCase() === query) {
        return true;
      }
      if (profile.recommendedCity.toLowerCase() === query) {
        return true;
      }
      return profile.aliases.some((alias) => alias.toLowerCase() === query);
    }) ?? null
  );
}
