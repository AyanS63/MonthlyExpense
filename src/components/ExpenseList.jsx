import { useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, Edit2 } from 'lucide-react';

export default function ExpenseList({ 
  expenses, 
  onExpenseDeleted,
  onEditRequest
}) {
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await axios.delete(`/api/expenses/${expenseToDelete}`);
      if (res.status === 200) {
        onExpenseDeleted();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setExpenseToDelete(null);
    }
  };

  const getBadgeClass = (category) => {
    switch(category) {
      case 'Housing': return 'badge-info';
      case 'Food': return 'badge-success';
      case 'Transportation': return 'badge-warning';
      case 'Utilities': return 'badge-info';
      case 'Entertainment': return 'badge-success';
      default: return 'badge-info';
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <p>No expenses found. Start tracking by adding one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="mb-4">Recent Expenses</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td data-label="Date">{new Date(expense.date).toLocaleDateString()}</td>
                  <td data-label="Title">
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{expense.title}</div>
                    {expense.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                        {expense.description}
                      </div>
                    )}
                  </td>
                  <td data-label="Category">
                    <span className={`badge ${getBadgeClass(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td data-label="Amount" style={{ fontWeight: 600 }}>Rs. {expense.amount.toFixed(2)}</td>
                  <td data-label="Paid" style={{ color: 'var(--success)' }}>Rs. {expense.paid?.toFixed(2) || '0.00'}</td>
                  <td data-label="Balance" style={{ color: (expense.balance > 0 ? 'var(--danger)' : 'var(--text-secondary)'), fontWeight: expense.balance > 0 ? 600 : 400 }}>
                    Rs. {expense.balance?.toFixed(2) || '0.00'}
                  </td>
                  <td data-label="Action" className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="btn-icon" 
                        onClick={() => onEditRequest(expense)}
                        title="Edit Expense"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => setExpenseToDelete(expense._id)}
                        title="Delete Expense"
                      >
                        <Trash2 size={18} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenseToDelete && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Confirm Deletion</h3>
            </div>
            <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn" 
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => setExpenseToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
