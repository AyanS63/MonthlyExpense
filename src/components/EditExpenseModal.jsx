import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Home, Utensils, Car, Zap, Play, MoreHorizontal, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

const CATEGORIES = [
  { name: 'Housing', icon: Home, color: '#3b82f6' },
  { name: 'Food', icon: Utensils, color: '#10b981' },
  { name: 'Transportation', icon: Car, color: '#f59e0b' },
  { name: 'Utilities', icon: Zap, color: '#06b6d4' },
  { name: 'Entertainment', icon: Play, color: '#8b5cf6' },
  { name: 'Other', icon: MoreHorizontal, color: '#94a3b8' },
];


export default function EditExpenseModal({ expense, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount.toString(),
    paid: expense.paid?.toString() || '0',
    balance: expense.balance?.toString() || '0',
    category: expense.category,
    description: expense.description || '',
    date: new Date(expense.date).toISOString().split('T')[0],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/api/expenses/${expense._id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        paid: parseFloat(formData.paid) || 0,
        balance: parseFloat(formData.balance) || 0,
      });
      if (res.status === 200) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.name === formData.category) || CATEGORIES[0];

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '95%' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Edit Expense</h2>
          <button onClick={onClose} className="btn-icon" style={{ padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
              <label className="form-label">Total Amount</label>
              <input
                type="number"
                required
                step="0.01"
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            
            <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
              <label className="form-label">Category</label>
              <div className="custom-select" ref={dropdownRef}>
                <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
                  <div className="flex items-center gap-2">
                    <selectedCategory.icon size={18} style={{ color: selectedCategory.color }} />
                    <span>{formData.category}</span>
                  </div>
                  <ChevronDown size={16} />
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
                style={{ borderColor: 'var(--success)' }}
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: '1' }}>
              <label className="form-label">Balance</label>
              <input
                type="text"
                readOnly
                className="form-input"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)', fontWeight: 'bold' }}
                value={`Rs. ${formData.balance}`}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
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

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
