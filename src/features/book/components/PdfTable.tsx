import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

const BASE_BORDER_COLOR = "#000000";
const BASE_BORDER_WIDTH = 0.25;

type DynamicStyle = Record<string, string | number | undefined | null>;

function unitToNumber(
  val: string | number | undefined | null
): number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;
  const s = String(val).trim();
  if (s.endsWith("pt")) {
    const n = parseFloat(s.replace("pt", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("px")) {
    const n = parseFloat(s.replace("px", ""));
    return Number.isNaN(n) ? undefined : n;
  }
  if (s.endsWith("in")) {
    const n = parseFloat(s.replace("in", ""));
    return Number.isNaN(n) ? undefined : n * 72;
  }
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
    fontFamily: "Museo Sans",
  },
});

/* Helpers */
function parsePadding(style: DynamicStyle | undefined) {
  const result: Record<string, number> = {};
  if (!style) return result;

  const padding = style.padding;
  const getNum = (v: string | number | undefined | null) => {
    const n = unitToNumber(v);
    return n === undefined ? undefined : n;
  };

  if (padding !== undefined && padding !== null) {
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

function parseBorderStyle(style: DynamicStyle | undefined) {
  const s: DynamicStyle = {};
  if (!style) return s;

  const parseSingle = (val: string | number | undefined | null) => {
    if (!val) return null;
    const str = String(val);
    let color = undefined;
    const colorMatch = str.match(/#([0-9a-fA-F]{3,6})/);
    if (colorMatch) color = `#${colorMatch[1]}`;
    else if (/windowtext/i.test(str)) color = "#000000";
    else {
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

function mapVerticalAlignToJustify(
  v?: string | number | null
): "flex-start" | "center" | "flex-end" {
  if (!v) return "flex-start";
  const val = String(v).toLowerCase();
  if (val === "middle" || val === "center") return "center";
  if (val === "bottom" || val === "end") return "flex-end";
  return "flex-start";
}

function normalizeWidth(width: string | number | undefined) {
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

function normalizeFontSize(
  fontSizeRaw: string | number | undefined | null,
  fallback = 10
) {
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
  isHeader?: boolean;
  wrap?: boolean;
}

export const PdfTableRow: React.FC<PdfTableRowProps> = ({
  children,
  style,
  wrap = false,
}) => {
  return (
    <View style={[styles.row, style || {}]} wrap={wrap}>
      {children}
    </View>
  );
};

interface PdfTableCellProps {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  style?: Style | DynamicStyle;
  width?: string | number;
  isHeader?: boolean;
  totalColumns?: number;
}

export const PdfTableCell: React.FC<PdfTableCellProps> = ({
  children,
  colSpan = 1,
  style = {},
  width,
  totalColumns = 1,
}) => {
  let resolvedWidth: string | number | undefined = normalizeWidth(width);
  if (!resolvedWidth) {
    const pct = (colSpan / (totalColumns || 1)) * 100;
    resolvedWidth = `${pct}%`;
  }

  const styleObj = style as DynamicStyle;
  const paddingParts = parsePadding(styleObj);
  const borderParts = parseBorderStyle(styleObj);

  const justifyContent = mapVerticalAlignToJustify(
    styleObj && (styleObj.verticalAlign ?? styleObj["vertical-align"])
  );

  const textAlignVal =
    (styleObj && (styleObj.textAlign ?? styleObj["text-align"])) || undefined;

  const isPlainText =
    typeof children === "string" ||
    typeof children === "number" ||
    (Array.isArray(children) &&
      children.every((c) => typeof c === "string" || typeof c === "number"));

  const alignItems = !isPlainText
    ? textAlignVal && typeof textAlignVal === "string"
      ? textAlignVal.toLowerCase() === "center"
        ? "center"
        : textAlignVal.toLowerCase() === "right"
        ? "flex-end"
        : "flex-start"
      : "flex-start"
    : undefined;

  const fontSizeFromStyle = normalizeFontSize(
    styleObj && (styleObj.fontSize ?? styleObj["font-size"]),
    10
  );

  const rawBg =
    styleObj && (styleObj.backgroundColor ?? styleObj["background-color"]);
  const backgroundColor = rawBg ? String(rawBg) : undefined;

  const cellStyle: Style = {
    ...styles.cellBase,
    width: resolvedWidth,
    backgroundColor,
    paddingTop: paddingParts.paddingTop ?? styles.cellBase.paddingTop,
    paddingBottom: paddingParts.paddingBottom ?? styles.cellBase.paddingBottom,
    paddingLeft: paddingParts.paddingLeft ?? styles.cellBase.paddingLeft,
    paddingRight: paddingParts.paddingRight ?? styles.cellBase.paddingRight,
    justifyContent: justifyContent,
    borderTopWidth: Number(
      borderParts.borderTopWidth ?? borderParts.borderWidth ?? BASE_BORDER_WIDTH
    ),
    borderTopColor: String(
      borderParts.borderTopColor ?? borderParts.borderColor ?? BASE_BORDER_COLOR
    ),
    borderRightWidth: Number(
      borderParts.borderRightWidth ??
        borderParts.borderWidth ??
        BASE_BORDER_WIDTH
    ),
    borderRightColor: String(
      borderParts.borderRightColor ??
        borderParts.borderColor ??
        BASE_BORDER_COLOR
    ),
    borderBottomWidth: Number(
      borderParts.borderBottomWidth ??
        borderParts.borderWidth ??
        BASE_BORDER_WIDTH
    ),
    borderBottomColor: String(
      borderParts.borderBottomColor ??
        borderParts.borderColor ??
        BASE_BORDER_COLOR
    ),
    borderLeftWidth: Number(
      borderParts.borderLeftWidth ??
        borderParts.borderWidth ??
        BASE_BORDER_WIDTH
    ),
    borderLeftColor: String(
      borderParts.borderLeftColor ??
        borderParts.borderColor ??
        BASE_BORDER_COLOR
    ),
    alignItems: alignItems as
      | "flex-start"
      | "flex-end"
      | "center"
      | "stretch"
      | "baseline"
      | undefined,
  };

  const renderChildren = () => {
    if (children === undefined || children === null) return null;
    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text
          style={[
            styles.cellText,
            {
              textAlign: textAlignVal as
                | "left"
                | "right"
                | "center"
                | "justify",
              fontSize: fontSizeFromStyle,
            },
          ]}
        >
          {String(children)}
        </Text>
      );
    }

    return React.Children.map(children, (child, idx) => {
      if (typeof child === "string" || typeof child === "number") {
        return (
          <Text
            key={idx}
            style={[
              styles.cellText,
              {
                textAlign: textAlignVal as
                  | "left"
                  | "right"
                  | "center"
                  | "justify",
                fontSize: fontSizeFromStyle,
              },
            ]}
          >
            {String(child)}
          </Text>
        );
      }

      try {
        if (React.isValidElement(child)) {
          const childElement = child as React.ReactElement<{ style?: Style }>;
          type ExtendedStyle = Style & {
            justifyContent?:
              | "flex-start"
              | "center"
              | "flex-end"
              | "space-between"
              | "space-around"
              | "space-evenly";
          };
          const childStyle: ExtendedStyle = (childElement.props.style ||
            {}) as ExtendedStyle;

          const mergedStyle: Style = {
            fontFamily: childStyle.fontFamily ?? "Museo Sans",
            fontSize: childStyle.fontSize ?? fontSizeFromStyle,
            textAlign:
              childStyle.textAlign ??
              (textAlignVal as
                | "left"
                | "right"
                | "center"
                | "justify"
                | undefined),
            justifyContent: childStyle.justifyContent ?? justifyContent,
          };

          return React.cloneElement(childElement, {
            key: idx,
            style: mergedStyle,
          });
        }
      } catch (error) {
        console.warn("Error cloning child in PdfTable", error);
      }
      return child;
    });
  };

  return (
    <View style={cellStyle} wrap>
      {renderChildren()}
    </View>
  );
};

export default PdfTable;
