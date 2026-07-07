import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return <table className={`min-w-full ${className}`}>{children}</table>;
}

export function TableHeader({ children, className = "" }: TableProps) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className = "" }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return <tr className={className}>{children}</tr>;
}

export function TableCell({
  children,
  isHeader = false,
  className = "",
}: TableCellProps) {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className}>{children}</CellTag>;
}