import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [exitData, setExitData] = useState([]);

  const colors = [
    "bg-gradient-to-r from-indigo-500 to-indigo-700",
    "bg-gradient-to-r from-emerald-500 to-emerald-700",
    "bg-gradient-to-r from-rose-500 to-rose-700",
    "bg-gradient-to-r from-amber-500 to-amber-700",
    "bg-gradient-to-r from-sky-500 to-sky-700",
  ];

  const barColors = ["#4f46e5", "#10b981", "#ef4444", "#f59e0b", "#0ea5e9", "#8b5cf6"];
useEffect(() => {
  const fetchData = () => {
    axios.get("http://localhost:8000/api/analytics/applications")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    axios.get("http://localhost:8000/api/analytics/payments")
      .then((res) => setPaymentData(res.data))
      .catch((err) => console.error(err));

    axios.get("http://localhost:8000/api/analytics/exit-bookings")
      .then((res) => setExitData(res.data))
      .catch((err) => console.error(err));
  };

  fetchData(); // initial fetch

  const interval = setInterval(fetchData, 5000); // every 5 seconds

  return () => clearInterval(interval); // cleanup when component unmounts
}, []);

  // compute total applications
  const total = data.reduce((sum, item) => sum + item.total, 0);

  // transform payment data into chart-friendly format
  const chartData = [];
  const paymentTypes = [...new Set(paymentData.map(d => d.payment_type))];

  const grouped = {};
  paymentData.forEach((item) => {
    if (!grouped[item.applicationType]) grouped[item.applicationType] = { applicationType: item.applicationType };
    grouped[item.applicationType][item.payment_type] = item.total;
  });
  Object.values(grouped).forEach((item) => chartData.push(item));

  // total exit bookings
  const totalExit = exitData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen p-6">
      {/* Main Header */}
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        Schedule of Entrance Exam
      </h2>

      {/* Application Cards */}
      <div className="flex flex-wrap gap-6 mb-12">
        {/* Total Card */}
        <div className="flex-1 min-w-[220px] p-6 rounded-2xl shadow-md text-white bg-gradient-to-r from-gray-700 to-gray-900 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Total Applications</h2>
            <p className="text-3xl font-bold">{total}</p>
          </div>
        </div>

        {/* Per ApplicationType Cards */}
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex-1 min-w-[220px] p-6 rounded-2xl shadow-md text-white ${colors[index % colors.length]} transition transform hover:scale-105`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{item.applicationType}</h2>
              <p className="text-3xl font-bold">{item.total}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Bar Graph */}
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        Payment Type per Application
      </h2>
      <div className="w-full h-96 bg-white rounded-2xl shadow-md p-4 mb-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="applicationType" />
            <YAxis />
            <Tooltip />
            <Legend />
            {paymentTypes.map((type, idx) => (
              <Bar
                key={idx}
                dataKey={type}
                fill={barColors[idx % barColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Exit Bookings Section */}
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        Exit Bookings per Department
      </h2>

      {/* Exit Cards */}
      <div className="flex flex-wrap gap-6 mb-12">
        {/* Total Exit Bookings */}
        <div className="flex-1 min-w-[220px] p-6 rounded-2xl shadow-md text-white bg-gradient-to-r from-gray-700 to-gray-900 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Total Exit Bookings</h2>
            <p className="text-3xl font-bold">{totalExit}</p>
          </div>
        </div>

        {/* Per Department Cards */}
        {exitData.map((item, index) => (
          <div
            key={index}
            className={`flex-1 min-w-[220px] p-6 rounded-2xl shadow-md text-white ${colors[index % colors.length]} transition transform hover:scale-105`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{item.department}</h2>
              <p className="text-3xl font-bold">{item.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
