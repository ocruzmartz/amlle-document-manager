import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

/**
 * PdfTable (final): fuerza Museo Sans y respeta fontSize numérico.
 * - BASE_BORDER_WIDTH = 0.5 (borders más delgados)
 * - Aplica fontFamily: "Museo Sans" a texto de celdas
 * - Convierte font sizes en pt (si vienen en '12pt' o en número) a numbers
 */

const BASE_BORDER_COLOR = "#ddd";
const BASE_BORDER_WIDTH = 0.5;

function unitToNumber(val: string | number | undefined) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;
  const s = String(val).trim();
  if (s.endsWith("pt")) {
    const n = parseFloat(s.replace("pt", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("px")) {
    // asumir px ~ pt 1:1 para react-pdf
    const n = parseFloat(s.replace("px", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("in")) {
    // 1in = 72pt
    const n = parseFloat(s.replace("in", ""));
    return Number.isNaN(n) ? undefined : n * 72;
  }
  // percentage or plain number
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
}

const styles = StyleSheet.create({
  tableWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "stretch",
  },
  cellBase: {
    borderRightWidth: BASE_BORDER_WIDTH,
    borderRightColor: BASE_BORDER_COLOR,
    borderBottomWidth: BASE_BORDER_WIDTH,
    borderBottomColor: BASE_BORDER_COLOR,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 6,
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  cellText: {
    fontSize: 10,
    lineHeight: 1.2,
    fontFamily: "Museo Sans", // <-- forzamos la familia aquí
  },
});

/* Helpers */
function parsePadding(style: any) {
  const result: any = {};
  if (!style) return result;

  const padding = style.padding ?? style["padding"] ?? undefined;
  const getNum = (v: any) => {
    const n = unitToNumber(v);
    return n === undefined ? undefined : n;
  };

  if (padding !== undefined) {
    const n = getNum(padding);
    if (n !== undefined) {
      result.paddingTop = n;
      result.paddingBottom = n;
      result.paddingLeft = n;
      result.paddingRight = n;
    }
  }

  const keys: Array<[string, string]> = [
    ["paddingTop", "padding-top"],
    ["paddingBottom", "padding-bottom"],
    ["paddingLeft", "padding-left"],
    ["paddingRight", "padding-right"],
  ];
  for (const [k, alt] of keys) {
    const v = style[k] ?? style[alt];
    const n = getNum(v);
    if (n !== undefined) result[k] = n;
  }
  return result;
}

function parseBorderStyle(style: any) {
  const s: any = {};
  if (!style) return s;

  const parseSingle = (val: any) => {
    if (!val) return null;
    const str = String(val);
    // color word -> map common names
    let color = undefined;
    const colorMatch = str.match(/#([0-9a-fA-F]{3,6})/);
    if (colorMatch) color = `#${colorMatch[1]}`;
    else if (/windowtext/i.test(str)) color = "#000000";
    else {
      // try rgb(...) -> convert to hex-ish simple fallback (let browser handle if not)
      const rgb = str.match(/rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/);
      if (rgb) {
        const r = parseInt(rgb[1], 10);
        const g = parseInt(rgb[2], 10);
        const b = parseInt(rgb[3], 10);
        color = `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)}`;
      }
    }
    const sizeMatch = str.match(/(\d+(?:\.\d+)?)(pt|px|in)?/);
    let size = undefined;
    if (sizeMatch) {
      size = unitToNumber(sizeMatch[0]);
    }
    return { size, color };
  };

  if (style.border) {
    const p = parseSingle(style.border);
    if (p) {
      s.borderWidth = p.size ?? BASE_BORDER_WIDTH;
      s.borderColor = p.color ?? BASE_BORDER_COLOR;
    }
  }

  const sides = ["Top", "Right", "Bottom", "Left"];
  for (const side of sides) {
    const key = `border${side}`;
    const dash = `border-${side.toLowerCase()}`;
    const v = style[key] ?? style[dash];
    const parsed = parseSingle(v);
    if (parsed) {
      s[`${key}Width`] = parsed.size ?? BASE_BORDER_WIDTH;
      s[`${key}Color`] = parsed.color ?? BASE_BORDER_COLOR;
    }
  }

  if (!s.borderWidth && style.borderWidth)
    s.borderWidth = unitToNumber(style.borderWidth) ?? BASE_BORDER_WIDTH;
  if (!s.borderColor && style.borderColor) s.borderColor = style.borderColor;

  return s;
}

function mapVerticalAlignToJustify(v?: string) {
  if (!v) return "flex-start";
  const val = String(v).toLowerCase();
  if (val === "middle" || val === "center") return "center";
  if (val === "bottom" || val === "end") return "flex-end";
  return "flex-start";
}

function normalizeWidth(width: any, totalColumns?: number) {
  if (typeof width === "string") {
    const w = width.trim();
    if (w.endsWith("%")) return w;
    if (w.endsWith("px")) {
      const n = parseFloat(w.replace("px", ""));
      if (!Number.isNaN(n)) return n;
    }
    const n = parseFloat(w);
    if (!Number.isNaN(n)) return `${n}%`;
  }
  if (typeof width === "number") {
    if (width > 0 && width <= 100) return `${width}%`;
    return width;
  }
  return undefined;
}

/* Convert font-size values like "12pt" or numeric into number for react-pdf */
function normalizeFontSize(fontSizeRaw: any, fallback = 10) {
  if (!fontSizeRaw && fontSizeRaw !== 0) return fallback;
  if (typeof fontSizeRaw === "number") return fontSizeRaw;
  const s = String(fontSizeRaw).trim();
  if (s.endsWith("pt")) {
    const v = parseFloat(s.replace("pt", ""));
    if (!Number.isNaN(v)) return v;
  }
  if (s.endsWith("px")) {
    const v = parseFloat(s.replace("px", ""));
    if (!Number.isNaN(v)) return v;
  }
  const v = parseFloat(s);
  return Number.isNaN(v) ? fallback : v;
}

/* Components */
interface PdfTableProps {
  children: React.ReactNode;
  totalColumns?: number;
}
export const PdfTable: React.FC<PdfTableProps> = ({ children }) => {
  return <View style={styles.tableWrapper}>{children}</View>;
};

interface PdfTableRowProps {
  children: React.ReactNode;
  style?: Style;
}
export const PdfTableRow: React.FC<PdfTableRowProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.row, style]}>{children}</View>;
};

interface PdfTableCellProps {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  style?: any;
  width?: string | number;
  isHeader?: boolean;
  totalColumns?: number;
}
export const PdfTableCell: React.FC<PdfTableCellProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  style = {},
  width,
  isHeader = false,
  totalColumns = 1,
}) => {
  let resolvedWidth: any = normalizeWidth(width, totalColumns);
  if (!resolvedWidth) {
    const pct = (colSpan / (totalColumns || 1)) * 100;
    resolvedWidth = `${pct}%`;
  }

  const paddingParts = parsePadding(style);
  const borderParts = parseBorderStyle(style);

  const justifyContent = mapVerticalAlignToJustify(
    style && (style.verticalAlign ?? style["vertical-align"])
  );

  const textAlignVal =
    (style && (style.textAlign ?? style["text-align"])) || undefined;
  const isPlainText =
    typeof children === "string" ||
    typeof children === "number" ||
    (Array.isArray(children) &&
      children.every((c) => typeof c === "string" || typeof c === "number"));

  const alignItems = !isPlainText
    ? textAlignVal
      ? textAlignVal.toLowerCase() === "center"
        ? "center"
        : textAlignVal.toLowerCase() === "right"
        ? "flex-end"
        : "flex-start"
      : "flex-start"
    : undefined;

  const fontSizeFromStyle = normalizeFontSize(
    style && (style.fontSize ?? style["font-size"]),
    10
  );

  const cellStyle: any = {
    ...styles.cellBase,
    width: resolvedWidth,
    backgroundColor:
      style && (style.backgroundColor ?? style["background-color"]),
    paddingTop: paddingParts.paddingTop ?? styles.cellBase.paddingTop,
    paddingBottom: paddingParts.paddingBottom ?? styles.cellBase.paddingBottom,
    paddingLeft: paddingParts.paddingLeft ?? styles.cellBase.paddingLeft,
    paddingRight: paddingParts.paddingRight ?? styles.cellBase.paddingRight,
    justifyContent,
    borderTopWidth:
      borderParts.borderTopWidth ??
      borderParts.borderWidth ??
      BASE_BORDER_WIDTH,
    borderTopColor:
      borderParts.borderTopColor ??
      borderParts.borderColor ??
      BASE_BORDER_COLOR,
    borderRightWidth:
      borderParts.borderRightWidth ??
      borderParts.borderWidth ??
      BASE_BORDER_WIDTH,
    borderRightColor:
      borderParts.borderRightColor ??
      borderParts.borderColor ??
      BASE_BORDER_COLOR,
    borderBottomWidth:
      borderParts.borderBottomWidth ??
      borderParts.borderWidth ??
      BASE_BORDER_WIDTH,
    borderBottomColor:
      borderParts.borderBottomColor ??
      borderParts.borderColor ??
      BASE_BORDER_COLOR,
    borderLeftWidth:
      borderParts.borderLeftWidth ??
      borderParts.borderWidth ??
      BASE_BORDER_WIDTH,
    borderLeftColor:
      borderParts.borderLeftColor ??
      borderParts.borderColor ??
      BASE_BORDER_COLOR,
    alignItems: alignItems ?? "flex-start",
  };

  const renderChildren = () => {
    if (children === undefined || children === null) return null;
    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text
          style={[
            styles.cellText,
            { textAlign: textAlignVal as any, fontSize: fontSizeFromStyle },
          ]}
        >
          {String(children)}
        </Text>
      );
    }

    // For React nodes, wrap plain string children in Text and enforce Museo Sans + fontSize
    return React.Children.map(children, (child, idx) => {
      if (typeof child === "string" || typeof child === "number") {
        return (
          <Text
            key={idx}
            style={[
              styles.cellText,
              { textAlign: textAlignVal as any, fontSize: fontSizeFromStyle },
            ]}
          >
            {String(child)}
          </Text>
        );
      }
      // if child is element (e.g. Text already), attempt to clone and inject fontFamily/fontSize if missing
      try {
        if (React.isValidElement(child)) {
          const childStyle = (child.props && child.props.style) || {};
          const mergedStyle = {
            fontFamily: childStyle.fontFamily ?? "Museo Sans",
            fontSize: childStyle.fontSize ?? fontSizeFromStyle,
            textAlign: childStyle.textAlign ?? textAlignVal,

            justifyContent:
              (childStyle as any).justifyContent ?? justifyContent,
          };
          return React.cloneElement(child as React.ReactElement, {
            key: idx,
            style: mergedStyle,
          });
        }
      } catch {}
      return child;
    });
  };

  return (
    <View
      style={cellStyle}
      wrap
      // @ts-ignore
      data-colspan={colSpan}
      // @ts-ignore
      data-rowspan={rowSpan}
    >
      {renderChildren()}
    </View>
  );
};

export default PdfTable;
