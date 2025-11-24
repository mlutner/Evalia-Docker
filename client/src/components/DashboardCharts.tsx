import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendData {
  month: string;
  responses: number;
}

export function ResponseTrendsChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Line type="monotone" dataKey="responses" stroke="#1F8EFA" strokeWidth={2} dot={{ fill: "#1F8EFA", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SurveyData {
  name: string;
  count: number;
}

export function CategoryBreakdownChart({ data }: { data: SurveyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar dataKey="count" fill="#1F8EFA" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistributionData {
  rating: string;
  count: number;
}

export function DistributionChart({ data }: { data: DistributionData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
        <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar dataKey="count" fill="#0D1B2A" opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ResponseVolumeData {
  day: string;
  responses: number;
}

export function ResponseVolumeChart({ data }: { data: ResponseVolumeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.2)" />
        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar dataKey="responses" fill="#0D1B2A" opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  );
}
