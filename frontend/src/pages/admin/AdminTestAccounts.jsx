import React, { useState, useEffect } from 'react';
import { Beaker, Plus, Trash2, Edit2, Search, Check, X, Building2, IndianRupee } from 'lucide-react';
import { getTestAccounts, createTestAccount, updateTestAccount, deleteTestAccount, getAllCompanies } from '../../config/api';

export default function AdminTestAccounts() {
  const [testAccounts, setTestAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    companyId: '',
    testAmount: '1',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const [accountsRes, companiesRes] = await Promise.all([
        getTestAccounts(),
        getAllCompanies(token)
      ]);
      setTestAccounts(accountsRes.testAccounts || []);
      // companiesRes is already an array, not wrapped in an object
      setCompanies(Array.isArray(companiesRes) ? companiesRes : companiesRes.companies || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTestAccount(editingId, formData);
      } else {
        await createTestAccount(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving test account');
    }
  };

  const handleEdit = (account) => {
    setEditingId(account._id);
    setFormData({
      companyId: account.companyId._id,
      testAmount: account.testAmount.toString(),
      description: account.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test account?')) return;
    try {
      await deleteTestAccount(id);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting test account');
    }
  };

  const handleToggleActive = async (account) => {
    try {
      await updateTestAccount(account._id, { isActive: !account.isActive });
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating test account');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ companyId: '', testAmount: '1', description: '' });
  };

  const filteredAccounts = testAccounts.filter(account =>
    account.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.companyId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get companies that don't already have test accounts
  const availableCompanies = companies.filter(company => 
    !testAccounts.some(ta => ta.companyId?._id === company._id) || 
    (editingId && testAccounts.find(ta => ta._id === editingId)?.companyId?._id === company._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Beaker size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Test Accounts</h1>
            <p className="text-sm text-slate-500 font-medium">Configure test accounts for payment gateway testing</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-sm font-bold text-purple-900 mb-1">How Test Accounts Work</h3>
        <p className="text-xs text-purple-700">
          Test accounts allow you to test payment flows with a fixed amount (e.g., ₹1) instead of the actual package price. 
          When a test account initiates payment, they'll be charged only the test amount, making it easy to verify the payment gateway integration.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Test Account
        </button>
      </div>

      {/* Test Accounts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Company</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3.5 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Test Amount</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3.5 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <Beaker size={28} className="text-slate-300" strokeWidth={2} />
                    </div>
                    <p className="font-bold text-slate-400">
                      {searchTerm ? 'No test accounts found' : 'No test accounts configured'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => (
                <tr key={account._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{account.companyId?.companyName || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{account.companyId?._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm">
                      <p className="text-slate-700 font-semibold">{account.companyId?.email || 'N/A'}</p>
                      <p className="text-slate-500 text-xs">{account.companyId?.phoneNumber || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg">
                      <IndianRupee size={14} className="text-purple-600" strokeWidth={2.5} />
                      <span className="text-sm font-black text-purple-700">{account.testAmount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-600">{account.description || '-'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleActive(account)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        account.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {account.isActive ? (
                        <>
                          <Check size={14} strokeWidth={2.5} />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={14} strokeWidth={2.5} />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4">
              {editingId ? 'Edit Test Account' : 'Add Test Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Select */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Company *</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={editingId} // Can't change company for existing test account
                >
                  <option value="">Select a company</option>
                  {availableCompanies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.companyName} ({company.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Test Amount (₹) *</label>
                <input
                  type="number"
                  value={formData.testAmount}
                  onChange={(e) => setFormData({ ...formData, testAmount: e.target.value })}
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Amount to charge when this company makes a payment</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional notes about this test account..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
