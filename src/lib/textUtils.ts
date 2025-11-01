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
