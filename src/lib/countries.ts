// [CYCL:a982bd88] Country type definitions and pure filter utility functions for the spinner feature
import countriesData from "@/data/countries.json";

export type ClimateZone =
  | "tropical"
  | "arid"
  | "temperate"
  | "continental"
  | "polar"
  | "mediterranean";

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Antarctica";

export interface Country {
  code: string;
  name: string;
  flag: string;
  continent: Continent;
  region: string;
  climateZones: ClimateZone[];
  visaFreeForUS: boolean;
  languages: string[];
  bestMonths: number[];
}

export const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ALL_CONTINENTS: Continent[] = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

export const ALL_CLIMATE_ZONES: ClimateZone[] = [
  "tropical",
  "arid",
  "temperate",
  "continental",
  "polar",
  "mediterranean",
];

export const allCountries: Country[] = countriesData as Country[];

export function filterByContinent(
  countries: Country[],
  continents: Continent[]
): Country[] {
  if (continents.length === 0) return countries;
  return countries.filter((c) => continents.includes(c.continent));
}

export function filterByClimate(
  countries: Country[],
  climates: ClimateZone[]
): Country[] {
  if (climates.length === 0) return countries;
  return countries.filter((c) =>
    c.climateZones.some((zone) => climates.includes(zone))
  );
}

export function filterByVisaFree(
  countries: Country[],
  visaFreeOnly: boolean
): Country[] {
  if (!visaFreeOnly) return countries;
  return countries.filter((c) => c.visaFreeForUS);
}

export function applyFilters(
  countries: Country[],
  options: {
    continents?: Continent[];
    climates?: ClimateZone[];
    visaFreeOnly?: boolean;
  }
): Country[] {
  let result = countries;
  if (options.continents && options.continents.length > 0) {
    result = filterByContinent(result, options.continents);
  }
  if (options.climates && options.climates.length > 0) {
    result = filterByClimate(result, options.climates);
  }
  if (options.visaFreeOnly) {
    result = filterByVisaFree(result, options.visaFreeOnly);
  }
  return result;
}

export function pickRandom(countries: Country[]): Country | null {
  if (countries.length === 0) return null;
  return countries[Math.floor(Math.random() * countries.length)];
}

export function getBestMonthsLabel(months: number[]): string {
  if (months.length === 0) return "Year-round";
  return months.map((m) => MONTH_NAMES[m]).join(", ");
}
