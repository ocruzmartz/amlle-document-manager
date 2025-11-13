import { isValid, format } from "date-fns";
import { es } from "date-fns/locale";

export const numberToWords = (num: number): string => {
  const units = [
    "",
    "Uno",
    "Dos",
    "Tres",
    "Cuatro",
    "Cinco",
    "Seis",
    "Siete",
    "Ocho",
    "Nueve",
  ];
  const tens = [
    "",
    "Diez",
    "Veinte",
    "Treinta",
    "Cuarenta",
    "Cincuenta",
    "Sesenta",
    "Setenta",
    "Ochenta",
    "Noventa",
  ];
  const hundreds = [
    "",
    "Ciento",
    "Doscientos",
    "Trescientos",
    "Cuatrocientos",
    "Quinientos",
    "Seiscientos",
    "Setecientos",
    "Ochocientos",
    "Novecientos",
  ];
  const specials: { [key: number]: string } = {
    10: "diez",
    11: "once",
    12: "doce",
    13: "trece",
    14: "catorce",
    15: "quince",
    16: "dieciséis",
    17: "diecisiete",
    18: "dieciocho",
    19: "diecinueve",
    20: "veinte",
    30: "treinta",
  };

  if (specials[num]) return specials[num];
  if (num > 15 && num < 20) return "Dieci" + units[num - 10];
  if (num > 20 && num < 30) return "Veinti" + units[num % 10];
  if (num >= 2000 && num < 3000) {
    const remainder = num - 2000;
    return "dos mil" + (remainder > 0 ? " " + numberToWords(remainder) : "");
  }
  if (num >= 100) {
    const exactHundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (num === 100) return "Cien";
    return (
      hundreds[exactHundred] +
      (remainder > 0 ? " " + numberToWords(remainder) : "")
    );
  }

  const ten = Math.floor(num / 10);
  const one = num % 10;
  let str = "";
  if (ten > 0) str += tens[ten] + (one > 0 ? " y " : "");
  if (one > 0) str += units[one];

  return str || num.toString();
};

export const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

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
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth es 0-11
  const day = String(date.getUTCDate()).padStart(2, "0"); // <-- Usar getUTCDate
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

  // Busca el patrón YYYY-MM-DD al inicio del string.
  // Esto funciona para "2025-11-13" Y para "2025-11-13T00:00:00.000Z"
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Meses en JS son 0-indexados
    const day = parseInt(match[3], 10);
    
    // Crea una fecha local a medianoche (ignorando la hora UTC)
    return new Date(year, month, day);
  }

  // Fallback para otros formatos (menos confiable)
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
