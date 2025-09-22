// src/lib/textUtils.ts

export const numberToWords = (num: number): string => {
  // ✅ Renamed from numeroALetras
  const units = [
    // ✅ Renamed
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
    // ✅ Renamed
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
    // ✅ Renamed
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
    // ✅ Renamed
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
  if (num > 15 && num < 20) return "dieci" + units[num - 10];
  if (num > 20 && num < 30) return "veinti" + units[num % 10];

  if (num >= 2000 && num < 3000) {
    const remainder = num - 2000; // ✅ Renamed
    return "dos mil" + (remainder > 0 ? " " + numberToWords(remainder) : "");
  }

  if (num >= 100) {
    const exactHundred = Math.floor(num / 100); // ✅ Renamed
    const remainder = num % 100; // ✅ Renamed
    if (num === 100) return "cien";
    return (
      hundreds[exactHundred] +
      (remainder > 0 ? " " + numberToWords(remainder) : "")
    );
  }

  const ten = Math.floor(num / 10); // ✅ Renamed
  const one = num % 10; // ✅ Renamed

  let str = "";
  if (ten > 0) str += tens[ten] + (one > 0 ? " y " : "");
  if (one > 0) str += units[one];

  return str || num.toString();
};

export const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
