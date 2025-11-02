import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import React from "react";

interface PdfTableProps {
  children: React.ReactNode;
  style?: Style;
  totalColumns?: number; // ✅ Nuevo: total de columnas de la tabla
}

interface PdfRowProps {
  children: React.ReactNode;
  isHeader?: boolean;
  style?: Style;
  totalColumns?: number; // ✅ Nuevo: pasar el total a las filas
}

interface PdfCellProps {
  children: React.ReactNode;
  isHeader?: boolean;
  style?: Style;
  colSpan?: number;
  rowSpan?: number;
  totalColumns?: number; // ✅ Nuevo: para calcular el ancho correcto
}

// ✅ Función helper para combinar estilos
const combineStyles = (...styles: (Style | undefined)[]): Style => {
  return styles
    .filter((style): style is Style => style !== undefined)
    .reduce((acc, style) => {
      return { ...acc, ...style };
    }, {} as Style);
};

const styles = StyleSheet.create({
  table: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#bfbfbf",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#bfbfbf",
    flexWrap: "nowrap",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    flexWrap: "nowrap",
  },
  cell: {
    padding: 6,
    borderRightWidth: 0.5,
    borderRightColor: "#bfbfbf",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  headerCell: {
    padding: 6,
    borderRightWidth: 0.5,
    borderRightColor: "#bfbfbf",
    fontWeight: 700,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
});

export const PdfTable: React.FC<PdfTableProps> = ({
  children,
  style,
  totalColumns = 1,
}) => {
  return (
    <View style={combineStyles(styles.table, style)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<PdfRowProps>, {
            totalColumns,
          });
        }
        return child;
      })}
    </View>
  );
};

export const PdfTableRow: React.FC<PdfRowProps> = ({
  children,
  isHeader,
  style,
  totalColumns = 1,
}) => {
  return (
    <View
      style={combineStyles(isHeader ? styles.headerRow : styles.row, style)}
      wrap={true}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<PdfCellProps>, {
            totalColumns,
          });
        }
        return child;
      })}
    </View>
  );
};

export const PdfTableCell: React.FC<PdfCellProps> = ({
  children,
  isHeader,
  style,
  colSpan = 1,
  totalColumns = 1,
}) => {
  // ✅ Calcular el ancho como porcentaje basado en colspan y total de columnas
  const widthPercentage = `${(colSpan / totalColumns) * 100}%`;

  return (
    <View
      style={combineStyles(isHeader ? styles.headerCell : styles.cell, style, {
        width: widthPercentage, // ✅ Ancho fijo basado en porcentaje
        flexShrink: 0, // ✅ No permitir que se encoja
        flexGrow: 0, // ✅ No permitir que crezca
      })}
    >
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </View>
  );
};
