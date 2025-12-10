import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#4b7bec",
  "#20bf6b",
  "#eb3b5a",
  "#f7b731",
  "#8854d0",
  "#0fb9b1",
  "#fd9644",
  "#a55eea",
];

const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No category data for this month.</p>;
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
