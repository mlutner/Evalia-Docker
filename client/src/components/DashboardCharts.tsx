import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3A8DFF';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary').trim() || '#6A7789';
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border').trim() || '#E2E7EF';
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-surface').trim() || '#FFFFFF';

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="month" stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Line type="monotone" dataKey="responses" stroke={primaryColor} strokeWidth={2} dot={{ fill: primaryColor, r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SurveyData {
  name: string;
  count: number;
}

export function CategoryBreakdownChart({ data }: { data: SurveyData[] }) {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3A8DFF';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary').trim() || '#6A7789';
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border').trim() || '#E2E7EF';
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-surface').trim() || '#FFFFFF';

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="name" stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="count" fill={primaryColor} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistributionData {
  rating: string;
  count: number;
}

export function DistributionChart({ data }: { data: DistributionData[] }) {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3A8DFF';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary').trim() || '#6A7789';
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border').trim() || '#E2E7EF';
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-surface').trim() || '#FFFFFF';

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="rating" stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="count" fill={primaryColor} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ResponseVolumeData {
  day: string;
  responses: number;
}

export function ResponseVolumeChart({ data }: { data: ResponseVolumeData[] }) {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3A8DFF';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-text-secondary').trim() || '#6A7789';
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-border').trim() || '#E2E7EF';
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-surface').trim() || '#FFFFFF';

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
        <XAxis dataKey="day" stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke={textColor} tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
          }}
        />
        <Bar dataKey="responses" fill={primaryColor} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
