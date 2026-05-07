import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Plus, ChevronDown, Home, Utensils, Car, Zap, Play, MoreHorizontal } from 'lucide-react';

const CATEGORIES = [
  { name: 'Housing', icon: Home, color: '#3b82f6' },
  { name: 'Food', icon: Utensils, color: '#10b981' },
  { name: 'Transportation', icon: Car, color: '#f59e0b' },
  { name: 'Utilities', icon: Zap, color: '#06b6d4' },
  { name: 'Entertainment', icon: Play, color: '#8b5cf6' },
  { name: 'Other', icon: MoreHorizontal, color: '#94a3b8' },
];

export default function ExpenseForm({ onExpenseAdded }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    paid: '',
    balance: '0',
    category: 'Housing',
    description: '',
    date: new Date().toLocaleDateString('en-CA'), // Returns YYYY-MM-DD in local time
  });

  useEffect(() => {
    const amt = parseFloat(formData.amount) || 0;
    const pd = parseFloat(formData.paid) || 0;
    setFormData(prev => ({ ...prev, balance: (amt - pd).toFixed(2) }));
  }, [formData.amount, formData.paid]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update date automatically when the day changes (midnight)
  useEffect(() => {
    const updateDateAtMidnight = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Tomorrow
        0, 0, 0 // Midnight
      );
      const msToMidnight = night.getTime() - now.getTime();

      const timer = setTimeout(() => {
        const today = new Date().toLocaleDateString('en-CA');
        setFormData(prev => ({ ...prev, date: today }));
        updateDateAtMidnight(); // Schedule for next day
      }, msToMidnight);

      return timer;
    };

    const timerId = updateDateAtMidnight();
    return () => clearTimeout(timerId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        paid: parseFloat(formData.paid) || 0,
        balance: parseFloat(formData.balance) || 0,
      });
      if (res.status === 201 || res.status === 200) {
        setFormData({ 
          ...formData, 
          title: '', 
          amount: '', 
          paid: '', 
          balance: '0', 
          description: '',
          date: new Date().toLocaleDateString('en-CA') // Always use fresh local date on reset
        });
        onExpenseAdded();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.name === formData.category) || CATEGORIES[0];

  return (
    <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 className="mb-4">Add New Expense</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            required
            className="form-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Grocery Shopping"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-input"
            style={{ minHeight: '80px', resize: 'vertical' }}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add more details..."
          />
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
            <label className="form-label">Amount (PKR)</label>
            <input
              type="number"
              required
              step="0.01"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group" style={{ flex: '1.5', minWidth: '180px' }}>
            <label className="form-label">Category</label>
            <div className="custom-select" ref={dropdownRef}>
              <div 
                className={`select-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="flex items-center gap-2">
                  <selectedCategory.icon size={18} style={{ color: selectedCategory.color }} />
                  <span>{formData.category}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isOpen && (
                <div className="select-options">
                  {CATEGORIES.map((cat) => (
                    <div 
                      key={cat.name}
                      className={`select-option ${formData.category === cat.name ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, category: cat.name });
                        setIsOpen(false);
                      }}
                    >
                      <div className="option-icon" style={{ background: `${cat.color}20` }}>
                        <cat.icon size={16} style={{ color: cat.color }} />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="form-group" style={{ flex: '1' }}>
            <label className="form-label">Paid Amount</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={formData.paid}
              onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="form-group" style={{ flex: '1' }}>
            <label className="form-label">Remaining Balance</label>
            <input
              type="text"
              readOnly
              className="form-input"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)', fontWeight: 'bold' }}
              value={`PKR ${formData.balance}`}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              required
              min={(() => {
                const now = new Date();
                return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
              })()}
              max={new Date().toLocaleDateString('en-CA')}
              className="form-input"
              style={{ colorScheme: 'dark' }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          <Plus size={18} />
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}
