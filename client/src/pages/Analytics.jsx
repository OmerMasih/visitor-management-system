import { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import DashboardSidebar from "../components/DashboardSidebar";
import "./Analytics.css";

const API_URL = "http://localhost:5000/api/visitors";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea", "#0891b2"];

// Authentication helper
const adminFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.assign("/admin/login");
    throw new Error("Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    window.location.assign("/admin/login");
  }

  return response;
};

function Analytics() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch visitor records
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminFetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load analytics.");
        }

        setVisitors(data.visitors || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Calculate analytics
  const analytics = useMemo(() => {
    const departmentCounts = {};
    const dailyCounts = {};
    const purposeCounts = {};

    visitors.forEach((visitor) => {
      const department = visitor.department || "Not specified";
      const purpose = visitor.purposeOfVisit || "Not specified";

      departmentCounts[department] = (departmentCounts[department] || 0) + 1;

      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;

      if (visitor.timeIn) {
        const date = new Date(visitor.timeIn);

        if (!Number.isNaN(date.getTime())) {
          const dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          dailyCounts[dateLabel] = (dailyCounts[dateLabel] || 0) + 1;
        }
      }
    });

    const daily = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);

    const departments = Object.entries(departmentCounts).map(
      ([name, visitors]) => ({ name, visitors }),
    );

    const purposes = Object.entries(purposeCounts)
      .map(([name, visitors]) => ({ name, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);

    const active = visitors.filter(
      (visitor) =>
        visitor.status !== "Checked Out" && visitor.status !== "Cancelled",
    ).length;

    const checkedOut = visitors.filter(
      (visitor) => visitor.status === "Checked Out",
    ).length;

    return {
      daily,
      departments,
      purposes,
      status: [
        { name: "Active", value: active },
        { name: "Checked Out", value: checkedOut },
      ],
      total: visitors.length,
    };
  }, [visitors]);

  return (
    <div className="admin-layout">
      <DashboardSidebar />

      <main className="admin-main">
        <div className="analytics-page">
          <header className="analytics-header">
            <p>BUSINESS INTELLIGENCE</p>
            <h1>Visitor Analytics</h1>
            <span>Understand visitor activity and administration trends.</span>
          </header>

          {error && <p className="analytics-error">{error}</p>}

          {loading ? (
            <p>Loading analytics...</p>
          ) : (
            <>
              {/* Total Visitors */}
              <section className="analytics-total-card">
                <span>Total Registered Visitors</span>
                <strong>{analytics.total}</strong>
              </section>

              <section className="analytics-grid">
                {/* Daily Visitor Activity */}
                <div className="analytics-card">
                  <h2>Daily Visitor Activity</h2>

                  {analytics.daily.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={analytics.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#2563eb"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No visitor date records available.</p>
                  )}
                </div>

                {/* Visitors by Department */}
                <div className="analytics-card">
                  <h2>Visitors by Department</h2>

                  {analytics.departments.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics.departments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No department records available.</p>
                  )}
                </div>

                {/* Visitor Status */}
                <div className="analytics-card">
                  <h2>Visitor Status</h2>

                  {analytics.total ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={analytics.status}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label
                        >
                          {analytics.status.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={index === 0 ? "#f59e0b" : "#16a34a"}
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No visitor records available.</p>
                  )}
                </div>

                {/* Most Common Visit Purposes */}
                <div className="analytics-card">
                  <h2>Most Common Visit Purposes</h2>

                  {analytics.purposes.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics.purposes} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={110} />
                        <Tooltip />
                        <Bar dataKey="visitors" fill="#0891b2" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No visit purpose records available.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Analytics;
