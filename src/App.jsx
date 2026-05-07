import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DashboardStats from '@/components/DashboardStats';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import EditExpenseModal from '@/components/EditExpenseModal';
import { Wallet, Filter, ChevronDown, Calendar } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showYearWarning, setShowYearWarning] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  useEffect(() => {
    if (selectedMonth !== 'all' && selectedYear === 'all') {
      setShowYearWarning(true);
    } else {
      setShowYearWarning(false);
    }
  }, [selectedMonth, selectedYear]);
  
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth !== 'all') params.month = selectedMonth;
      if (selectedYear !== 'all') params.year = selectedYear;
      
      const res = await axios.get('/api/expenses', { params });
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthRef.current && !monthRef.current.contains(event.target)) setIsMonthOpen(false);
      if (yearRef.current && !yearRef.current.contains(event.target)) setIsYearOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startYear = 2026;
  const currentRealYear = new Date().getFullYear();
  const endYear = Math.max(currentRealYear + 5, 2030);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString());

  return (
    <div className="container">
      <header className="app-header animate-fade-in">
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={24} />
          </div>
          <span>Monthly Expense</span>
        </div>

        {showYearWarning && (
          <div className="animate-fade-in" style={{ 
            width: '100%', 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.3)', 
            borderRadius: '12px',
            color: '#f59e0b',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Filter size={16} />
            <span><strong>Note:</strong> You've selected a month. Please select a <strong>Year</strong> to see accurate results for that period.</span>
          </div>
        )}

        <div className="flex items-center gap-2" style={{ width: '100%', flexWrap: 'wrap' }}>
          {/* Month Filter */}
          <div className="custom-select" style={{ flex: '1', minWidth: '140px' }} ref={monthRef}>
            <div 
              className={`select-trigger ${isMonthOpen ? 'active' : ''}`}
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              style={{ minHeight: '40px', padding: '0.5rem 0.75rem' }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.875rem' }}>
                  {selectedMonth === 'all' ? 'All Months' : MONTHS[parseInt(selectedMonth) - 1]}
                </span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
            </div>
            {isMonthOpen && (
              <div className="select-options" style={{ top: 'calc(100% + 5px)' }}>
                <div className={`select-option ${selectedMonth === 'all' ? 'selected' : ''}`} onClick={() => { setSelectedMonth('all'); setIsMonthOpen(false); }}>
                  All Months
                </div>
                {MONTHS.map((month, idx) => {
                  const monthValue = (idx + 1).toString();
                  return (
                    <div 
                      key={month} 
                      className={`select-option ${selectedMonth === monthValue ? 'selected' : ''}`}
                      onClick={() => { setSelectedMonth(monthValue); setIsMonthOpen(false); }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Year Filter */}
          <div className="custom-select" style={{ flex: '1', minWidth: '100px' }} ref={yearRef}>
            <div 
              className={`select-trigger ${isYearOpen ? 'active' : ''}`}
              onClick={() => setIsYearOpen(!isYearOpen)}
              style={{ minHeight: '40px', padding: '0.5rem 0.75rem' }}
            >
              <div className="flex items-center gap-2">
                <Filter size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.875rem' }}>
                  {selectedYear === 'all' ? 'All Years' : selectedYear}
                </span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
            </div>
            {isYearOpen && (
              <div className="select-options" style={{ top: 'calc(100% + 5px)' }}>
                <div className={`select-option ${selectedYear === 'all' ? 'selected' : ''}`} onClick={() => { setSelectedYear('all'); setIsYearOpen(false); }}>
                  All Years
                </div>
                {years.map(year => (
                  <div 
                    key={year} 
                    className={`select-option ${selectedYear === year ? 'selected' : ''}`}
                    onClick={() => { setSelectedYear(year); setIsYearOpen(false); }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {loading && expenses.length === 0 ? (
        <div className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>Loading your financial data...</div>
      ) : (
        <>
          <DashboardStats 
            expenses={expenses} 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
          />
          
          <div className="dashboard-grid">
            <div className="form-section">
              <ExpenseForm onExpenseAdded={fetchExpenses} />
            </div>
            <div className="list-section">
              <ExpenseList 
                expenses={expenses} 
                onExpenseDeleted={fetchExpenses} 
                onEditRequest={(exp) => setEditingExpense(exp)}
              />
            </div>
          </div>

          {editingExpense && (
            <EditExpenseModal 
              expense={editingExpense} 
              onClose={() => setEditingExpense(null)} 
              onUpdate={fetchExpenses} 
            />
          )}
        </>
      )}
    </div>
  );
}

