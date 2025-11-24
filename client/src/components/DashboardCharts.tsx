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
  const primaryColor = '#37C0A3';
  const accentColor = '#37C0A3';
  const axisColor = '#6A7789';
  const surfaceColor = '#FFFFFF';
  const borderColor = '#E2E7EF';

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
  const primaryColor = '#1F6F78';
  const axisColor = '#6A7789';
  const surfaceColor = '#FFFFFF';
  const borderColor = '#E2E7EF';

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
  const primaryColor = '#A3D65C';
  const axisColor = '#6A7789';
  const surfaceColor = '#FFFFFF';
  const borderColor = '#E2E7EF';

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
  const primaryColor = '#2F8FA5';
  const axisColor = '#6A7789';
  const surfaceColor = '#FFFFFF';
  const borderColor = '#E2E7EF';

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
