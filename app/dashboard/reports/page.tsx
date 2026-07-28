"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const reportData = [
  { month: "Jan", registrations: 420, memories: 5200, deliveries: 310, engagement: 62 },
  { month: "Feb", registrations: 480, memories: 6100, deliveries: 360, engagement: 65 },
  { month: "Mar", registrations: 510, memories: 5800, deliveries: 390, engagement: 68 },
  { month: "Apr", registrations: 560, memories: 7200, deliveries: 420, engagement: 71 },
  { month: "May", registrations: 610, memories: 8100, deliveries: 470, engagement: 74 },
  { month: "Jun", registrations: 680, memories: 9400, deliveries: 510, engagement: 78 },
];

const chartConfig = {
  registrations: { label: "Registrations", color: "var(--chart-1)" },
  memories: { label: "Memories", color: "var(--chart-2)" },
  deliveries: { label: "Deliveries", color: "var(--chart-3)" },
  engagement: { label: "Engagement %", color: "var(--chart-4)" },
} satisfies ChartConfig;

const reportTypes = [
  "User Registrations",
  "Memory Creation",
  "Scheduled Deliveries",
  "User Engagement",
  "Daily Activity",
  "Monthly Growth",
  "Subscription Reports",
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState(reportTypes[0]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and export reports for growth, engagement, and subscriptions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("PDF report exported")}
            >
              <FileText className="size-4" />
              Export PDF
            </Button>
            <Button onClick={() => toast.success("Excel report exported")}>
              <FileSpreadsheet className="size-4" />
              Export Excel
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Choose a report type to review trends and export.
            </CardDescription>
          </div>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Registrations", value: "3,260" },
            { label: "Memories Created", value: "41,800" },
            { label: "Deliveries", value: "2,460" },
            { label: "Avg Engagement", value: "69.7%" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{reportType}</CardTitle>
            <CardDescription>Monthly trend overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={reportData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={
                    reportType.includes("Memory")
                      ? "memories"
                      : reportType.includes("Deliver")
                        ? "deliveries"
                        : reportType.includes("Engagement")
                          ? "engagement"
                          : "registrations"
                  }
                  fill="var(--color-registrations)"
                  radius={6}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
            <CardDescription>Cross-metric growth line</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={reportData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="registrations"
                  stroke="var(--color-registrations)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="deliveries"
                  stroke="var(--color-deliveries)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quick Export</CardTitle>
            <CardDescription>
              Download the currently selected report as PDF or Excel.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => toast.success(`${reportType} downloaded`)}
          >
            <Download className="size-4" />
            Download {reportType}
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
