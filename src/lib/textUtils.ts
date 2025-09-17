// src/lib/textUtils.ts
export const numeroALetras = (num: number): string => {
  const unidades = [
    "",
    "un",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const decenas = [
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
  const centenas = [
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

  const especiales: { [key: number]: string } = {
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

  if (especiales[num]) return especiales[num];
  if (num > 15 && num < 20) return "dieci" + unidades[num - 10];
  if (num > 20 && num < 30) return "veinti" + unidades[num % 10];

  if (num >= 2000 && num < 3000) {
    const resto = num - 2000;
    return "dos mil" + (resto > 0 ? " " + numeroALetras(resto) : "");
  }

  if (num >= 100) {
    const cienExacto = Math.floor(num / 100);
    const resto = num % 100;
    if (num === 100) return "cien";
    return centenas[cienExacto] + (resto > 0 ? " " + numeroALetras(resto) : "");
  }

  const diez = Math.floor(num / 10);
  const uno = num % 10;

  let str = "";
  if (diez > 0) str += decenas[diez] + (uno > 0 ? " y " : "");
  if (uno > 0) str += unidades[uno];

  return str || num.toString();
};

export const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
