// filepath: src/lib/textUtils.ts
import { isValid, format } from "date-fns";
import { es } from "date-fns/locale";

// Función auxiliar para capitalizar (ya la tenías, la usamos abajo)
export const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

export const numberToWords = (num: number): string => {
  // 1. Cambiamos todo a minúsculas para evitar "VeintiUno"
  const units = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const tens = [
    "",
    "diez",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const hundreds = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];
  const specials: { [key: number]: string } = {
    10: "diez",
    11: "once",
    12: "doce",
    13: "trece",
    14: "catorce",
    15: "quince",
    16: "dieciséis", // Corregido con tilde
    17: "diecisiete",
    18: "dieciocho",
    19: "diecinueve",
    20: "veinte",
    30: "treinta",
  };

  // Helper interno para formatear sin capitalizar aún
  const resolveNumber = (n: number): string => {
    if (specials[n]) return specials[n];

    if (n > 15 && n < 20) return "dieci" + units[n - 10];
    if (n > 20 && n < 30) return "veinti" + units[n % 10];

    if (n >= 2000 && n < 3000) {
      const remainder = n - 2000;
      return "dos mil" + (remainder > 0 ? " " + resolveNumber(remainder) : "");
    }

    if (n >= 100) {
      const exactHundred = Math.floor(n / 100);
      const remainder = n % 100;
      if (n === 100) return "cien";
      return (
        hundreds[exactHundred] +
        (remainder > 0 ? " " + resolveNumber(remainder) : "")
      );
    }

    const ten = Math.floor(n / 10);
    const one = n % 10;
    let str = "";
    if (ten > 0) str += tens[ten] + (one > 0 ? " y " : "");
    if (one > 0) str += units[one];

    return str || n.toString();
  };

  // 2. Obtenemos el texto en minúscula y capitalizamos solo la primera letra
  const result = resolveNumber(num);
  return capitalize(result);
};

export const numberToRoman = (num: number): string => {
  if (isNaN(num) || num <= 0) return String(num);

  const romanNumerals: { [key: string]: number } = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let roman = "";

  for (const key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      roman += key;
      num -= romanNumerals[key];
    }
  }
  return roman;
};

export const formatDateToISO = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const parseDateSafely = (
  dateString: string | undefined
): Date | undefined => {
  if (!dateString) return undefined;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  const date = new Date(dateString);
  if (isValid(date)) return date;
  return undefined;
};

export const formatUIDate = (dateString: string | undefined): string => {
  if (!dateString) return "Sin fecha";
  const date = parseDateSafely(dateString);
  if (!date || !isValid(date)) return "Fecha inválida";
  return format(date, "dd 'de' MMM, yyyy", { locale: es });
};

export const removeEmptyParagraphsAtStart = (html: string): string => {
  if (!html) return "";
  return html.replace(/^(<p><\/p>|<p>\s*<\/p>|<p>&nbsp;<\/p>)+/i, "");
};

export const formatDateTime = (
  dateInput: string | Date | undefined | null
): string => {
  if (!dateInput) return "—";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!isValid(date)) return "Fecha inválida";

  const utcTime = date.getTime();

  const OFFSET_HOURS = 7;
  const svTime = new Date(utcTime - OFFSET_HOURS * 60 * 60 * 1000);

  const day = String(svTime.getUTCDate()).padStart(2, "0");
  const month = String(svTime.getUTCMonth() + 1).padStart(2, "0");
  const year = svTime.getUTCFullYear();

  const hours = String(svTime.getUTCHours()).padStart(2, "0");
  const minutes = String(svTime.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};
