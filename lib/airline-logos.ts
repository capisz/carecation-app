const IATA_TO_ICAO: Record<string, string> = {
  "3U": "CSC",
  "4U": "GWI",
  "5J": "CEB",
  "6E": "IGO",
  "7C": "JJA",
  "8M": "MMA",
  "9W": "JAI",
  AA: "AAL",
  AC: "ACA",
  AF: "AFR",
  AI: "AIC",
  AK: "AXM",
  AM: "AMX",
  AS: "ASA",
  AT: "RAM",
  AV: "AVA",
  AY: "FIN",
  AZ: "ITY",
  BA: "BAW",
  BI: "RBA",
  BL: "PIC",
  BR: "EVA",
  B6: "JBU",
  CA: "CCA",
  CI: "CAL",
  CM: "CMP",
  CX: "CPA",
  CZ: "CSN",
  DL: "DAL",
  EK: "UAE",
  ET: "ETH",
  EY: "ETD",
  F9: "FFT",
  FD: "AIQ",
  FM: "CSH",
  FR: "RYR",
  GA: "GIA",
  GF: "GFA",
  G3: "GLO",
  HA: "HAL",
  HO: "DKH",
  HU: "CHH",
  HY: "UZB",
  IB: "IBE",
  J2: "AHY",
  JD: "CBJ",
  JL: "JAL",
  JQ: "JST",
  JU: "ASL",
  KA: "HDA",
  KC: "KZR",
  KE: "KAL",
  KL: "KLM",
  KQ: "KQA",
  KU: "KAC",
  LA: "LAN",
  LH: "DLH",
  LO: "LOT",
  LS: "EXS",
  LX: "SWR",
  LY: "ELY",
  ME: "MEA",
  MH: "MAS",
  MI: "SLK",
  MK: "MAU",
  MS: "MSR",
  MU: "CES",
  NH: "ANA",
  NK: "NKS",
  NZ: "ANZ",
  OD: "MXD",
  OK: "CSA",
  OS: "AUA",
  OU: "CTN",
  OZ: "AAR",
  PC: "PGT",
  PG: "BKP",
  PR: "PAL",
  QF: "QFA",
  QR: "QTR",
  RJ: "RJA",
  RO: "ROT",
  S7: "SBI",
  SA: "SAA",
  SK: "SAS",
  SN: "BEL",
  SQ: "SIA",
  SU: "AFL",
  SV: "SVA",
  TG: "THA",
  TK: "THY",
  TP: "TAP",
  TR: "TGW",
  UA: "UAL",
  UL: "ALK",
  U2: "EZY",
  UX: "AEA",
  VA: "VOZ",
  VN: "HVN",
  VY: "VLG",
  VS: "VIR",
  W6: "WZZ",
  WN: "SWA",
  WS: "WJA",
  WY: "OMA",
};

const AIRLINE_NAME_TO_ICAO: Record<string, string> = {
  "AIR FRANCE": "AFR",
  "AIR CANADA": "ACA",
  "AMERICAN AIRLINES": "AAL",
  "BRITISH AIRWAYS": "BAW",
  "DELTA AIR LINES": "DAL",
  "EMIRATES": "UAE",
  "ETIHAD AIRWAYS": "ETD",
  "EVA AIR": "EVA",
  "JAPAN AIRLINES": "JAL",
  "JETBLUE AIRWAYS": "JBU",
  "KLM ROYAL DUTCH AIRLINES": "KLM",
  "KOREAN AIR": "KAL",
  "LUFTHANSA": "DLH",
  "QATAR AIRWAYS": "QTR",
  "SINGAPORE AIRLINES": "SIA",
  "SWISS INTERNATIONAL AIR LINES": "SWR",
  "THAI AIRWAYS": "THA",
  "TURKISH AIRLINES": "THY",
  "UNITED AIRLINES": "UAL",
};

function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function getAirlineLogoCandidates(
  carrierCode?: string | null,
  carrierName?: string | null,
): string[] {
  const code = (carrierCode ?? "").trim().toUpperCase();
  const name = (carrierName ?? "").trim();
  const codes = new Set<string>();

  if (code.length === 3) {
    codes.add(code);
  }

  if (code.length === 2 && IATA_TO_ICAO[code]) {
    codes.add(IATA_TO_ICAO[code]);
  }

  if (name) {
    const normalized = normalizeName(name);
    const byName = AIRLINE_NAME_TO_ICAO[normalized];
    if (byName) {
      codes.add(byName);
    }
  }

  return Array.from(codes).map((icaoCode) => `/airline-logos/${icaoCode}.png`);
}

