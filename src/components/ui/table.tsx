import { cn } from "@/utils";
import type * as React from "react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table data-slot="table" className={cn("min-w-full", className)} {...props} />;
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={className} {...props} />;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
}

function TableCell({ isHeader = false, className, ...props }: TableCellProps) {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag data-slot="table-cell" className={className} {...props} />;
}

export { Table, TableBody, TableCell, TableHeader, TableRow };
