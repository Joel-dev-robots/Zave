import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PriceChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (!data || data.length === 0) {
      setError('No price data available');
      setIsLoading(false);
      return;
    }

    try {
      // Formatear los datos para el gráfico
      const formattedData = data.map(item => {
        const date = new Date(item.date);
        return {
          dateObj: date,
          date: date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric' 
          }),
          price: item.price,
          tooltip: date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
      });

      // Ordenar por fecha (de más antigua a más reciente)
      formattedData.sort((a, b) => a.dateObj - b.dateObj);

      // Calcular el rango de precios para el eje Y
      const prices = formattedData.map(item => item.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const padding = (maxPrice - minPrice) * 0.1; // 10% de padding

      setPriceRange({
        min: minPrice - padding,
        max: maxPrice + padding
      });
      setChartData(formattedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing chart data:", err);
      setError("Failed to process price data");
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading price data...
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {error || "No price data available"}
      </div>
    );
  }

  // Calcular porcentaje de cambio entre primer y último precio
  const firstPrice = chartData[0].price;
  const lastPrice = chartData[chartData.length - 1].price;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPriceUp = priceChange >= 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
          tickLine={{ stroke: '#6B7280' }}
          tickCount={5}
        />
        <YAxis
          domain={[priceRange.min, priceRange.max]}
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
          tickLine={{ stroke: '#6B7280' }}
          tickFormatter={(value) => `€${value.toFixed(2)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '0.375rem',
            color: '#F3F4F6'
          }}
          labelStyle={{ color: '#9CA3AF' }}
          formatter={(value) => [`€${value.toFixed(2)}`, 'Price']}
          labelFormatter={(value, entry) => entry[0]?.payload?.tooltip || value}
        />
        <ReferenceLine
          y={firstPrice}
          stroke="#9CA3AF"
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={isPriceUp ? "#10B981" : "#EF4444"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: isPriceUp ? "#10B981" : "#EF4444" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart; 