import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { theme } from "@/theme";

const COLORS = {
  primary: 'var(--color-primary)',
  text: 'var(--color-neutral-text-secondary)',
  border: 'var(--color-neutral-border)',
  surface: 'var(--color-neutral-surface)',
};

interface TrendData {
  month: string;
  responses: number;
}

export function ResponseTrendsChart({ data }: { data: TrendData[] }) {
  const primaryColor = theme.colors.iconTeal;
  const accentColor = theme.colors.iconTeal;
  const axisColor = theme.colors.textSecondary;
  const surfaceColor = '#FFFFFF';
  const borderColor = theme.colors.border;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Line type="monotone" dataKey="responses" stroke={primaryColor} strokeWidth={2.5} dot={{ fill: accentColor, r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SurveyData {
  name: string;
  count: number;
}

export function CategoryBreakdownChart({ data }: { data: SurveyData[] }) {
  const primaryColor = theme.colors.primary;
  const axisColor = theme.colors.textSecondary;
  const surfaceColor = '#FFFFFF';
  const borderColor = theme.colors.border;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="count" fill={primaryColor} isAnimationActive={false} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistributionData {
  rating: string;
  count: number;
}

export function DistributionChart({ data }: { data: DistributionData[] }) {
  const primaryColor = theme.colors.lime;
  const axisColor = theme.colors.textSecondary;
  const surfaceColor = '#FFFFFF';
  const borderColor = theme.colors.border;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="rating" stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="count" fill={primaryColor} isAnimationActive={false} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ResponseVolumeData {
  day: string;
  responses: number;
}

export function ResponseVolumeChart({ data }: { data: ResponseVolumeData[] }) {
  const primaryColor = theme.colors.primary;
  const axisColor = theme.colors.textSecondary;
  const surfaceColor = '#FFFFFF';
  const borderColor = theme.colors.border;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="day" stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={axisColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="responses" fill={primaryColor} isAnimationActive={false} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
