import { PieChart, Calendar, Wallet, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useState } from 'react';


export default function DashboardStats({ expenses, selectedMonth, selectedYear }) {
  const [showWarning, setShowWarning] = useState(false);
  const currentRealMonth = new Date().getMonth();
  const currentRealYear = new Date().getFullYear();

  // Total for the currently selected period (Month/Year filter)
  const selectedPeriodTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Specifically the total PAID for the current real-world month (from the provided data)
  const thisMonthPaidTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentRealMonth && d.getFullYear() === currentRealYear;
    })
    .reduce((sum, e) => sum + (e.paid || 0), 0);

  const categories = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0] || 'N/A';

  const isExportDisabled = selectedMonth === 'all' || selectedYear === 'all';

  const exportToExcel = () => {
    if (isExportDisabled) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    const totalBalance = expenses.reduce((sum, e) => sum + (e.balance || 0), 0);

    // 1. Prepare Data
    const reportData = [
      ["MONTHLY EXPENSE TRACKER - DETAILED TRANSACTION LOG"],
      ["Generated On:", new Date().toLocaleString()],
      [""],
      ["Date", "Category", "Item Title", "Description", "Total Bill (Rs.)", "Paid (Rs.)", "Balance (Rs.)"],
      ...expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category.toUpperCase(),
        e.title,
        e.description || "N/A",
        e.amount.toFixed(2),
        (e.paid || 0).toFixed(2),
        (e.balance || 0).toFixed(2)
      ]),
      [""], // Spacer
      ["", "", "", "GRAND TOTAL", 
        selectedPeriodTotal.toFixed(2), 
        (selectedPeriodTotal - totalBalance).toFixed(2), 
        totalBalance.toFixed(2)
      ]
    ];

    // 2. Create Workbook and Sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(reportData);

    // 3. Set Column Widths
    ws['!cols'] = [
      { wch: 15 }, // Date
      { wch: 22 }, // Category
      { wch: 30 }, // Item Title
      { wch: 45 }, // Description
      { wch: 18 }, // Total Amount
      { wch: 15 }, // Paid
      { wch: 15 }  // Balance
    ];

    // 4. Set Cell Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Main Title
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    
    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = selectedMonth === 'all' ? 'All Months' : MONTH_NAMES[parseInt(selectedMonth) - 1];
    const fileName = `Monthly Expense of ${monthName}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="flex items-center gap-2">
            <div className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Wallet size={20} />
            </div>
            <span className="stat-title">Selected Period Total</span>
          </div>
          <div className="stat-value">Rs. {selectedPeriodTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="flex items-center gap-2">
            <div className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Calendar size={20} />
            </div>
            <span className="stat-title">This Month's Spending</span>
          </div>
          <div className="stat-value">Rs. {thisMonthPaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="flex items-center gap-2">
            <div className="btn-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <PieChart size={20} />
            </div>
            <span className="stat-title">Top Category</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{topCategory}</div>
        </div>

        <div 
          className={`glass-card stat-card ${isExportDisabled ? 'disabled-card' : ''}`}
          onClick={exportToExcel}
          style={{ 
            cursor: isExportDisabled ? 'not-allowed' : 'pointer', 
            border: showWarning ? '1px solid var(--danger)' : (isExportDisabled ? '1px solid var(--border-color)' : '1px dashed var(--accent-primary)'),
            background: showWarning ? 'rgba(239, 68, 68, 0.05)' : (isExportDisabled ? 'rgba(255, 255, 255, 0.02)' : 'rgba(59, 130, 246, 0.05)'),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            opacity: isExportDisabled ? 0.7 : 1,
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          {showWarning && (
            <div 
              style={{ 
                position: 'absolute', 
                top: '-45px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                background: 'var(--danger)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={14} />
              Please select a specific Month & Year
            </div>
          )}
          
          <div className="btn-icon" style={{ 
            background: isExportDisabled ? 'rgba(255,255,255,0.1)' : 'var(--accent-gradient)', 
            color: isExportDisabled ? 'var(--text-secondary)' : 'white' 
          }}>
            <Download size={20} />
          </div>
          <div className="flex flex-col">
            <span className="stat-title" style={{ 
              color: isExportDisabled ? 'var(--text-secondary)' : 'var(--accent-primary)', 
              fontWeight: 'bold' 
            }}>
              Export Report
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isExportDisabled ? 'Select period to enable' : 'Download Excel (.xlsx)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
