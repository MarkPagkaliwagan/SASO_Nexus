import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, X } from 'react-feather';

export default function StaffPanel() {
  const [staffs, setStaffs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    password: '',
  });

  const token = localStorage.getItem('token');

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffs(res.data);
    } catch (err) {
      console.error('Failed to fetch staffs', err);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const openModal = (staff = null) => {
    setEditingStaff(staff);
    if (staff) {
      setForm({
        name: staff.name,
        email: staff.email,
        position: staff.position || '',
        password: '',
      });
    } else {
      setForm({ name: '', email: '', position: '', password: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingStaff) {
        await axios.put(`http://127.0.0.1:8000/api/staff/${editingStaff.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/staff`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchStaffs();
      setShowModal(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaffs();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-green-700">Staff Accounts</h2>
        <button
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => openModal()}
        >
          <PlusCircle size={18} /> Add Staff
        </button>
      </div>

      <table className="w-full table-auto border text-sm">
        <thead>
          <tr className="bg-green-100 text-left">
            {['ID', 'Name', 'Email', 'Position', 'Created At', 'Updated At', 'Actions'].map((title) => (
              <th key={title} className="p-2 border">{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff) => (
            <tr key={staff.id} className="hover:bg-gray-50">
              <td className="p-2 border">{staff.id}</td>
              <td className="p-2 border">{staff.name}</td>
              <td className="p-2 border">{staff.email}</td>
              <td className="p-2 border">{staff.position || '—'}</td>
              <td className="p-2 border">{staff.created_at}</td>
              <td className="p-2 border">{staff.updated_at}</td>
              <td className="p-2 border flex gap-2">
                <button
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => openModal(staff)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  className="text-red-600 hover:underline flex items-center gap-1"
                  onClick={() => handleDelete(staff.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              <X />
            </button>
            <h3 className="text-xl font-bold mb-4">
              {editingStaff ? 'Edit Staff' : 'Add Staff'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder={editingStaff ? 'New Password (optional)' : 'Password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required={!editingStaff}
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {editingStaff ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
