import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useGetReportsSummaryQuery } from "../../services/api";
import "./Reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  // Use cached query - data is automatically cached and reused
  const { data: data, isLoading: loading, error } = useGetReportsSummaryQuery();

  const stats = {
    cases: { total: data?.cases || 0, by_status: {} },
    contracts: { total: data?.contracts || 0, by_type: {} },
    fatwas: { total: data?.fatwas || 0 },
    investigations: { total: data?.investigations || 0 },
    appeals: { total: data?.appeals || 0 },
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  // بيانات القضايا حسب الحالة
  const casesByStatusData = {
    labels: Object.keys(stats.cases.by_status || {}).map(
      (status) =>
        ({
          pending: "قيد الانتظار",
          active: "قيد التنفيذ",
          closed: "مغلقة",
        }[status] || status)
    ),
    datasets: [
      {
        label: "عدد القضايا",
        data: Object.values(stats.cases.by_status || {}),
        backgroundColor: ["#ffc107", "#17a2b8", "#28a745"],
      },
    ],
  };

  // بيانات العقود حسب النوع
  const contractsByTypeData = {
    labels: Object.keys(stats.contracts.by_type || {}).map(
      (type) =>
        ({
          service: "خدمات",
          supply: "توريد",
          consulting: "استشارات",
          maintenance: "صيانة",
          other: "أخرى",
        }[type] || type)
    ),
    datasets: [
      {
        label: "عدد العقود",
        data: Object.values(stats.contracts.by_type || {}),
        backgroundColor: "#007bff",
      },
    ],
  };

  // بيانات إجمالية
  const totalData = {
    labels: ["القضايا", "العقود", "الفتاوى", "التحقيقات", "التظلمات"],
    datasets: [
      {
        label: "الإجمالي",
        data: [
          stats.cases.total,
          stats.contracts.total,
          stats.fatwas.total,
          stats.investigations.total,
          stats.appeals.total,
        ],
        backgroundColor: [
          "#36454F",
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
        ],
      },
    ],
  };

  // بيانات خطية للقضايا الشهرية (مثال)
  const monthlyCasesData = {
    labels: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    datasets: [
      {
        label: "القضايا",
        data: Array(12).fill(0), // سيتم ملؤها من الـ API
        borderColor: "#36454F",
        backgroundColor: "rgba(54, 69, 79, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>التقارير والإحصائيات</h2>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon cases">
            <i className="ri-file-list-3-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.cases.total}</h3>
            <p>إجمالي القضايا</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon contracts">
            <i className="ri-file-text-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.contracts.total}</h3>
            <p>إجمالي العقود</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon fatwas">
            <i className="ri-book-open-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.fatwas.total}</h3>
            <p>إجمالي الفتاوى</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon investigations">
            <i className="ri-search-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.investigations.total}</h3>
            <p>إجمالي التحقيقات</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon appeals">
            <i className="ri-alert-line"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.appeals.total}</h3>
            <p>إجمالي التظلمات</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>القضايا حسب الحالة</h3>
          <Bar
            data={casesByStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>العقود حسب النوع</h3>
          <Bar
            data={contractsByTypeData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>التوزيع الإجمالي</h3>
          <Pie
            data={totalData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h3>القضايا الشهرية</h3>
          <Line
            data={monthlyCasesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
