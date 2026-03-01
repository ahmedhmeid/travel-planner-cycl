// [CYCL:26141bd3] Client-side helpers for user destination (bucket list) data fetching and mutation

export type DestinationStatus = "wishlist" | "visited";

export interface UserDestination {
  id: string;
  user_id: string;
  country_code: string; // ISO 3166-1 alpha-2
  status: DestinationStatus;
  added_at: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export async function fetchDestinations(): Promise<UserDestination[]> {
  const res = await fetch("/api/user/destinations");
  if (!res.ok) throw new Error("Failed to fetch destinations");
  return res.json();
}

export async function addDestination(
  countryCode: string,
  status: DestinationStatus
): Promise<UserDestination> {
  const res = await fetch("/api/user/destinations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country_code: countryCode, status }),
  });
  if (!res.ok) throw new Error("Failed to add destination");
  return res.json();
}

export async function updateDestination(
  countryCode: string,
  status: DestinationStatus
): Promise<UserDestination> {
  const res = await fetch(`/api/user/destinations/${countryCode}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update destination");
  return res.json();
}

export async function removeDestination(countryCode: string): Promise<void> {
  const res = await fetch(`/api/user/destinations/${countryCode}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove destination");
}

// ─── ISO 3166-1 alpha-2 → alpha-3 mapping ────────────────────────────────────
// Used to match the world-atlas TopoJSON country codes in react-simple-maps

export const alpha2ToAlpha3: Record<string, string> = {
  AF: "AFG", AL: "ALB", DZ: "DZA", AD: "AND", AO: "AGO", AG: "ATG",
  AR: "ARG", AM: "ARM", AU: "AUS", AT: "AUT", AZ: "AZE", BS: "BHS",
  BH: "BHR", BD: "BGD", BB: "BRB", BY: "BLR", BE: "BEL", BZ: "BLZ",
  BJ: "BEN", BT: "BTN", BO: "BOL", BA: "BIH", BW: "BWA", BR: "BRA",
  BN: "BRN", BG: "BGR", BF: "BFA", BI: "BDI", CV: "CPV", KH: "KHM",
  CM: "CMR", CA: "CAN", CF: "CAF", TD: "TCD", CL: "CHL", CN: "CHN",
  CO: "COL", KM: "COM", CG: "COG", CD: "COD", CR: "CRI", CI: "CIV",
  HR: "HRV", CU: "CUB", CY: "CYP", CZ: "CZE", DK: "DNK", DJ: "DJI",
  DM: "DMA", DO: "DOM", EC: "ECU", EG: "EGY", SV: "SLV", GQ: "GNQ",
  ER: "ERI", EE: "EST", SZ: "SWZ", ET: "ETH", FJ: "FJI", FI: "FIN",
  FR: "FRA", GA: "GAB", GM: "GMB", GE: "GEO", DE: "DEU", GH: "GHA",
  GR: "GRC", GD: "GRD", GT: "GTM", GN: "GIN", GW: "GNB", GY: "GUY",
  HT: "HTI", HN: "HND", HU: "HUN", IS: "ISL", IN: "IND", ID: "IDN",
  IR: "IRN", IQ: "IRQ", IE: "IRL", IL: "ISR", IT: "ITA", JM: "JAM",
  JP: "JPN", JO: "JOR", KZ: "KAZ", KE: "KEN", KI: "KIR", KP: "PRK",
  KR: "KOR", KW: "KWT", KG: "KGZ", LA: "LAO", LV: "LVA", LB: "LBN",
  LS: "LSO", LR: "LBR", LY: "LBY", LI: "LIE", LT: "LTU", LU: "LUX",
  MG: "MDG", MW: "MWI", MY: "MYS", MV: "MDV", ML: "MLI", MT: "MLT",
  MH: "MHL", MR: "MRT", MU: "MUS", MX: "MEX", FM: "FSM", MD: "MDA",
  MC: "MCO", MN: "MNG", ME: "MNE", MA: "MAR", MZ: "MOZ", MM: "MMR",
  NA: "NAM", NR: "NRU", NP: "NPL", NL: "NLD", NZ: "NZL", NI: "NIC",
  NE: "NER", NG: "NGA", MK: "MKD", NO: "NOR", OM: "OMN", PK: "PAK",
  PW: "PLW", PA: "PAN", PG: "PNG", PY: "PRY", PE: "PER", PH: "PHL",
  PL: "POL", PT: "PRT", QA: "QAT", RO: "ROU", RU: "RUS", RW: "RWA",
  KN: "KNA", LC: "LCA", VC: "VCT", WS: "WSM", SM: "SMR", ST: "STP",
  SA: "SAU", SN: "SEN", RS: "SRB", SC: "SYC", SL: "SLE", SG: "SGP",
  SK: "SVK", SI: "SVN", SB: "SLB", SO: "SOM", ZA: "ZAF", SS: "SSD",
  ES: "ESP", LK: "LKA", SD: "SDN", SR: "SUR", SE: "SWE", CH: "CHE",
  SY: "SYR", TW: "TWN", TJ: "TJK", TZ: "TZA", TH: "THA", TL: "TLS",
  TG: "TGO", TO: "TON", TT: "TTO", TN: "TUN", TR: "TUR", TM: "TKM",
  TV: "TUV", UG: "UGA", UA: "UKR", AE: "ARE", GB: "GBR", US: "USA",
  UY: "URY", UZ: "UZB", VU: "VUT", VE: "VEN", VN: "VNM", YE: "YEM",
  ZM: "ZMB", ZW: "ZWE",
};

export function getAlpha3(alpha2: string): string | undefined {
  return alpha2ToAlpha3[alpha2.toUpperCase()];
}

// ─── ISO 3166-1 alpha-2 → numeric code mapping ───────────────────────────────
// world-atlas countries-110m.json uses numeric codes as feature IDs

export const alpha2ToNumeric: Record<string, number> = {
  AF: 4, AL: 8, DZ: 12, AD: 20, AO: 24, AG: 28, AR: 32, AM: 51,
  AU: 36, AT: 40, AZ: 31, BS: 44, BH: 48, BD: 50, BB: 52, BY: 112,
  BE: 56, BZ: 84, BJ: 204, BT: 64, BO: 68, BA: 70, BW: 72, BR: 76,
  BN: 96, BG: 100, BF: 854, BI: 108, CV: 132, KH: 116, CM: 120, CA: 124,
  CF: 140, TD: 148, CL: 152, CN: 156, CO: 170, KM: 174, CG: 178, CD: 180,
  CR: 188, CI: 384, HR: 191, CU: 192, CY: 196, CZ: 203, DK: 208, DJ: 262,
  DM: 212, DO: 214, EC: 218, EG: 818, SV: 222, GQ: 226, ER: 232, EE: 233,
  SZ: 748, ET: 231, FJ: 242, FI: 246, FR: 250, GA: 266, GM: 270, GE: 268,
  DE: 276, GH: 288, GR: 300, GD: 308, GT: 320, GN: 324, GW: 624, GY: 328,
  HT: 332, HN: 340, HU: 348, IS: 352, IN: 356, ID: 360, IR: 364, IQ: 368,
  IE: 372, IL: 376, IT: 380, JM: 388, JP: 392, JO: 400, KZ: 398, KE: 404,
  KI: 296, KP: 408, KR: 410, KW: 414, KG: 417, LA: 418, LV: 428, LB: 422,
  LS: 426, LR: 430, LY: 434, LI: 438, LT: 440, LU: 442, MG: 450, MW: 454,
  MY: 458, MV: 462, ML: 466, MT: 470, MH: 584, MR: 478, MU: 480, MX: 484,
  FM: 583, MD: 498, MC: 492, MN: 496, ME: 499, MA: 504, MZ: 508, MM: 104,
  NA: 516, NR: 520, NP: 524, NL: 528, NZ: 554, NI: 558, NE: 562, NG: 566,
  MK: 807, NO: 578, OM: 512, PK: 586, PW: 585, PA: 591, PG: 598, PY: 600,
  PE: 604, PH: 608, PL: 616, PT: 620, QA: 634, RO: 642, RU: 643, RW: 646,
  KN: 659, LC: 662, VC: 670, WS: 882, SM: 674, ST: 678, SA: 682, SN: 686,
  RS: 688, SC: 690, SL: 694, SG: 702, SK: 703, SI: 705, SB: 90, SO: 706,
  ZA: 710, SS: 728, ES: 724, LK: 144, SD: 729, SR: 740, SE: 752, CH: 756,
  SY: 760, TW: 158, TJ: 762, TZ: 834, TH: 764, TL: 626, TG: 768, TO: 776,
  TT: 780, TN: 788, TR: 792, TM: 795, TV: 798, UG: 800, UA: 804, AE: 784,
  GB: 826, US: 840, UY: 858, UZ: 860, VU: 548, VE: 862, VN: 704, YE: 887,
  ZM: 894, ZW: 716,
};

export function getNumericCode(alpha2: string): number | undefined {
  return alpha2ToNumeric[alpha2.toUpperCase()];
}
