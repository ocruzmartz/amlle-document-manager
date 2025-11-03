import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

const styles = StyleSheet.create({
  table: {
    display: "flex",
    width: "100%",
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  headerCell: {
    fontWeight: 700,
    backgroundColor: "#f8f9fa",
  },
});

interface PdfTableProps {
  children: React.ReactNode;
  totalColumns: number;
}

export const PdfTable = ({ children, totalColumns }: PdfTableProps) => {
  return (
    <View style={styles.table}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<PdfTableRowProps>, {
              totalColumns,
            })
          : child
      )}
    </View>
  );
};

interface PdfTableRowProps {
  children: React.ReactNode;
  isHeader?: boolean;
  totalColumns?: number;
  style?: Style;
}

export const PdfTableRow = ({
  children,
  isHeader = false,
  totalColumns = 1,
  style: customStyle = {},
}: PdfTableRowProps) => {
  return (
    <View style={[styles.row, customStyle]}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<PdfTableCellProps>, {
              totalColumns,
              isHeader,
            })
          : child
      )}
    </View>
  );
};

interface PdfTableCellProps {
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
  style?: Style;
  totalColumns?: number;
  width?: string;
}

export const PdfTableCell = ({
  children,
  colSpan = 1,
  isHeader = false,
  style: customStyle = {},
  totalColumns = 1,
  width,
}: PdfTableCellProps) => {
  const cellWidth = width || `${(colSpan / totalColumns) * 100}%`;

  const cellStyle: Style = {
    ...styles.cell,
    width: cellWidth,
    ...customStyle,
  };

  if (isHeader) {
    cellStyle.fontWeight = 700;
    cellStyle.backgroundColor = "#f8f9fa";
  }

  return <View style={cellStyle}>{children}</View>;
};
