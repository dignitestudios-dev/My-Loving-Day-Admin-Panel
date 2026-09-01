"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, CalendarIcon, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { useDashboardGraphQuery } from "@/hooks/use-dashboard";
import type { DashboardGraphType } from "@/lib/api/dashboard.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const chartConfig = {
  users: { label: "Users", color: "#0254B8" },
  memories: { label: "Memories", color: "#0470e0" },
  subscriptions: { label: "Subscriptions", color: "#3b8ef0" },
} satisfies ChartConfig;

function parseValidDate(date: string | null | undefined): Date | null {
  if (!date || typeof date !== "string") return null;
  const trimmed = date.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === "invalid date" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d;
  }
  const parts = trimmed.split(/[-/]/).map(Number);
  if (parts.length >= 2 && !parts.some(isNaN)) {
    const year = parts[0];
    const month = parts[1] - 1;
    const day = parts[2] || 1;
    const fallbackDate = new Date(year, month, day);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }
  return null;
}

function formatChartDate(
  date: string | null | undefined,
  type: DashboardGraphType
): string {
  const d = parseValidDate(date);
  if (!d) return "";
  if (type === "yearly") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  if (type === "monthly" || type === "custom") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function toDateValue(value: string | undefined | null) {
  if (!value) return undefined;
  const parts = value.split("-").map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return undefined;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? undefined : d;
}

function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from || isNaN(range.from.getTime())) return null;
  const from = range.from.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (!range.to || isNaN(range.to.getTime())) return from;
  const to = range.to.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${from} - ${to}`;
}

export function DashboardGraph() {
  const [graphType, setGraphType] = useState<DashboardGraphType>("monthly");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const graphParams = useMemo(
    () => ({
      type: graphType,
      startDate:
        graphType === "custom" ? customRange?.startDate : undefined,
      endDate: graphType === "custom" ? customRange?.endDate : undefined,
    }),
    [graphType, customRange]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useDashboardGraphQuery(graphParams);

  const chartData = useMemo(
    () =>
      (data ?? [])
        .filter((point) => point && parseValidDate(point.date) !== null)
        .map((point) => ({
          ...point,
          label: formatChartDate(point.date, graphType),
        })),
    [data, graphType]
  );

  const handleTypeChange = (value: string) => {
    setGraphType(value as DashboardGraphType);
    setCustomRange(null);
    setTempRange(undefined);
  };

  const applyCustomRange = () => {
    if (!tempRange?.from || !tempRange?.to) return;
    setCustomRange({
      startDate: toApiDate(tempRange.from),
      endDate: toApiDate(tempRange.to),
    });
    setGraphType("custom");
    setCalendarOpen(false);
  };

  const clearCustomRange = () => {
    setTempRange(undefined);
    setCustomRange(null);
    setGraphType("monthly");
    setCalendarOpen(false);
  };

  const rangeLabel = formatRangeLabel(
    customRange
      ? {
          from: toDateValue(customRange.startDate),
          to: toDateValue(customRange.endDate),
        }
      : tempRange
  );

  return (
    <Card className="border shadow-sm">
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>
            Users, memories, and subscriptions over time
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={graphType === "custom" ? "" : graphType}
            onValueChange={handleTypeChange}
          >
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "size-9 shrink-0",
                  graphType === "custom" &&
                    "border-primary bg-primary/5 text-primary"
                )}
                aria-label="Select custom date range"
              >
                <CalendarIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="space-y-3 p-3">
                <div>
                  <p className="text-sm font-medium">Custom Range</p>
                  <p className="text-muted-foreground text-xs">
                    {rangeLabel || "Select start and end date"}
                  </p>
                </div>
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={tempRange}
                  defaultMonth={tempRange?.from}
                  onSelect={setTempRange}
                />
                <div className="flex items-center justify-end gap-2 border-t pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCustomRange}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyCustomRange}
                    disabled={!tempRange?.from || !tempRange?.to}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {graphType === "custom" && customRange ? (
          <p className="text-muted-foreground text-sm">
            Showing data from{" "}
            <span className="text-foreground font-medium">
              {toDateValue(customRange.startDate)?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>{" "}
            to{" "}
            <span className="text-foreground font-medium">
              {toDateValue(customRange.endDate)?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        ) : null}

        {graphType === "custom" && !customRange ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Select a date range from the calendar.
          </p>
        ) : isLoading ? (
          <Skeleton className="h-[320px] w-full rounded-lg" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              Failed to load graph data.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full text-muted-foreground">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No activity data available
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                There is no activity recorded for the selected time period.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isFetching ? (
              <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center rounded-lg">
                <Loader2 className="text-primary size-6 animate-spin" />
              </div>
            ) : null}
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <AreaChart
                data={chartData}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="users"
                  type="monotone"
                  fill="var(--color-users)"
                  fillOpacity={0.15}
                  stroke="var(--color-users)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="memories"
                  type="monotone"
                  fill="var(--color-memories)"
                  fillOpacity={0.15}
                  stroke="var(--color-memories)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="subscriptions"
                  type="monotone"
                  fill="var(--color-subscriptions)"
                  fillOpacity={0.15}
                  stroke="var(--color-subscriptions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
