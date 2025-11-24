import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendData {
  month: string;
  responses: number;
}

export function ResponseTrendsChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7EBF0" />
        <XAxis dataKey="month" stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7EBF0",
          }}
        />
        <Line type="monotone" dataKey="responses" stroke="#1F8EFA" strokeWidth={2} dot={{ fill: "#1F8EFA", r: 4, style: { fill: "#1F8EFA" } }} isAnimationActive={false} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E7EBF0" />
        <XAxis dataKey="name" stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7EBF0",
          }}
        />
        <Bar dataKey="count" fill="#1F8EFA" isAnimationActive={false} shape={{ style: { fill: "#1F8EFA" } }} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E7EBF0" />
        <XAxis dataKey="rating" stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7EBF0",
          }}
        />
        <Bar dataKey="count" fill="#1F8EFA" isAnimationActive={false} shape={{ style: { fill: "#1F8EFA" } }} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E7EBF0" />
        <XAxis dataKey="day" stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <YAxis stroke="#6B7785" tick={{ fontSize: 12, fontWeight: 500 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E7EBF0",
          }}
        />
        <Bar dataKey="responses" fill="#1F8EFA" isAnimationActive={false} shape={{ style: { fill: "#1F8EFA" } }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
