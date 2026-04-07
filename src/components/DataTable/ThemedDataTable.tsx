"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ThemeProvider } from "./ThemeProvider";
import { DataTable } from "@/components/ui/data-table";

interface ThemedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  defaultTheme?: "dark" | "light";
}

export function ThemedDataTable<TData, TValue>({
  columns,
  data,
  title,
  description,
  searchKey,
  searchPlaceholder,
  defaultTheme = "dark",
}: ThemedDataTableProps<TData, TValue>) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <div className="w-full h-full">
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <DataTable
              columns={columns}
              data={data}
              searchKey={searchKey}
              searchPlaceholder={searchPlaceholder}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
