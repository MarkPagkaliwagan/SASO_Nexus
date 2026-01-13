import React, {  useState, useEffect, useRef} from 'react';
import { CheckCircle, Edit, Trash, Printer, Save, User } from 'react-feather';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPersonnel() {
  const [formData, setFormData] = useState({
    profile: null,
    fullName: '',
    email: '',
    contact: '',
    position: '',
    unit: '',
  });
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [sortField, setSortField] = useState('fullName');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortByControl, setSortByControl] = useState('fullName');
  const [sortOrderControl, setSortOrderControl] = useState('asc');
  const [customPosition, setCustomPosition] = useState('');

 const positions = {
  'OIC, Student Affairs and Services Office': [
    'Officer-in-Charge',
    'Director, Student Affairs and Services',
    'Assistant Director, Student Affairs and Services',
    'Student Affairs Officer',
    'Administrative Staff'
  ],
  'Guidance Office': [
    'Guidance Coordinator',
    'Guidance Counselor',
    'Psychological Services Coordinator',
    'Testing and Assessment Officer',
    'Guidance Staff'
  ],
  'Student Formation and Development Unit (SFDU)': [
    'Student Development Officer',
    'Student Welfare Officer',
    'Discipline Officer',
    'Leadership and Training Coordinator',
    'Student Assistant'
  ],
  'School Clinic': [
    'School Physician',
    'School Nurse',
    'Health Services Coordinator',
    'Clinic Staff'
  ],
  'Campus Ministry': [
    'Chaplain',
    'Campus Ministry Coordinator',
    'Religious Activities Coordinator',
    'Campus Ministry Staff',
    'Student Assistant'
  ],
  'Sports Development Unit': [
    'Sports Development Coordinator',
    'Athletics Director',
    'Physical Education Instructor',
    'Coach',
    'Sports Staff'
  ]
};

  const units = [
    'OIC, Student Affairs and Services Office',
    'Guidance Office',
    'Student Formation and Development Unit (SFDU)',
    'School Clinic',
    'Campus Ministry',
    'Sports Development Unit',
  ];

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setSortByControl(sortField);
    setSortOrderControl(sortAsc ? 'asc' : 'desc');
  }, [sortField, sortAsc]);

  const fetchPersonnel = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/personnel');
      const data = await res.json();
      setPersonnelList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile' && files && files[0]) {
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      const objUrl = URL.createObjectURL(files[0]);
      setFormData({ ...formData, profile: files[0] });
      setPreview(objUrl);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleEdit = (person) => {
  setEditingId(person.id);

  // Fill input fields
  setFormData({
    fullName: person.fullName || '',
    email: person.email || '',
    contact: person.contact || '',
    position: person.position || '',
    unit: person.unit || '',
    profile: null, // file input is empty initially
  });

  // Normalize profile path
  const existing = person.profile ? person.profile.trim() : null;
  setExistingProfile(existing);

  // Set preview URL
  let previewUrl = null;
  if (existing) {
    if (existing.startsWith('http://') || existing.startsWith('https://')) {
      // Already a full URL
      previewUrl = existing;
    } else {
      // Backend returns a relative path
      previewUrl = `http://localhost:8000/storage/${existing}`;
    }
  }

  // Remove previous blob URLs
  if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
    URL.revokeObjectURL(preview);
  }

  setPreview(previewUrl);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append('fullName', formData.fullName);
    payload.append('email', formData.email);
    payload.append('contact', formData.contact);
    payload.append('unit', formData.unit);
    if (formData.position === "Others") {
      payload.append('position', customPosition);
    } else {
      payload.append('position', formData.position);
    }

    if (formData.profile) {
      payload.append('profile', formData.profile);
    } else if (editingId && existingProfile) {
      payload.append('existingProfile', existingProfile);
    }

    const url = editingId
      ? `http://localhost:8000/api/personnel/${editingId}`
      : `http://localhost:8000/api/personnel`;

    if (editingId) payload.append('_method', 'PUT');

    try {
      const res = await fetch(url, { method: 'POST', body: payload });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error saving personnel');

      setFormData({ profile: null, fullName: '', email: '', contact: '', position: '', unit: '' });
      setExistingProfile(null);
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setPreview(null);
      setEditingId(null);
      // ✅ Reset file input field
if (fileInputRef.current) {
  fileInputRef.current.value = null;
}
      fetchPersonnel();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this personnel?')) return;
    try {
      await fetch(`http://localhost:8000/api/personnel/${id}`, { method: 'DELETE' });
      fetchPersonnel();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (field) => {
    if (!field) return;
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const applySortControl = () => {
    setSortField(sortByControl);
    setSortAsc(sortOrderControl === 'asc');
  };

  const filtered = personnelList.filter((p) => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery;
    return (
      String(p.id).toLowerCase().includes(q) ||
      (p.fullName || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.contact || '').toLowerCase().includes(q) ||
      (p.position || '').toLowerCase().includes(q) ||
      (p.unit || '').toLowerCase().includes(q)
    );
  });

  const sortedList = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (valA == null && valB == null) return 0;
    if (valA == null) return sortAsc ? -1 : 1;
    if (valB == null) return sortAsc ? 1 : -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }

    const aStr = String(valA).toLowerCase();
    const bStr = String(valB).toLowerCase();
    if (aStr < bStr) return sortAsc ? -1 : 1;
    if (aStr > bStr) return sortAsc ? 1 : -1;
    return 0;
  });

  const headers = [
    { label: 'ID', field: 'id' },
    { label: 'Full Name', field: 'fullName' },
    { label: 'Email', field: 'email' },
    { label: 'Contact', field: 'contact' },
    { label: 'Position', field: 'position' },
    { label: 'Unit', field: 'unit' },
    { label: 'Actions', field: null },
  ];

  const fileInputRef = useRef(null); // ✅ REF for the file input

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 text-black">
      {/* Form */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">
          {editingId ? 'Edit Personnel' : 'Add New Personnel'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-2">
            <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-green-300 overflow-hidden flex items-center justify-center bg-gray-100">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <User size={40} />
                  <span className="text-[11px] sm:text-xs mt-1">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col w-full">
              <label className="font-semibold text-gray-700 mb-1">Profile Picture</label>
<input
  type="file"
  name="profile"
  accept="image/*"
  onChange={handleChange}
  className="border rounded-md p-1 cursor-pointer w-full"
  ref={fileInputRef} // ✅ attach ref here
/>


              {preview && (
<button
  type="button"
  onClick={() => {
    if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setFormData({ ...formData, profile: null });
    setPreview(existingProfile ? (existingProfile.startsWith('http') ? existingProfile : `http://localhost:8000/storage/${existingProfile}`) : null);
  }}
  className="mt-2 text-sm text-red-500 self-start"
>
  Remove selection
</button>

              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>

            {/* Contact */}
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>

{/* Position */}
<div className="flex flex-col">
  <label className="font-semibold text-gray-700 mb-1">Position</label>

  <select
    name="position"
    value={formData.position}
    onChange={(e) => {
      handleChange(e);
      if (e.target.value !== "Others") setCustomPosition("");
    }}
    required
    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
    disabled={!formData.unit} // ✅ disable if no unit selected
  >
    <option value="">Select Position</option>

    {/* Show positions based on selected unit */}
    {formData.unit && positions[formData.unit].map((pos) => (
      <option key={pos} value={pos}>{pos}</option>
    ))}

    <option value="Others">Others</option>
  </select>

  {formData.position === "Others" && (
    <input
      type="text"
      placeholder="Enter custom position"
      value={customPosition}
      onChange={(e) => setCustomPosition(e.target.value)}
      className="mt-2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
      required
    />
  )}
</div>



{/* Unit */}
<div className="flex flex-col">
  <label className="font-semibold text-gray-700 mb-1">Unit</label>
  <select
    name="unit"
    value={formData.unit}
    onChange={(e) => {
      setFormData({
        ...formData,
        unit: e.target.value,
        position: '', // reset position kapag nagbago ang unit
      });
      setCustomPosition('');
    }}
    required
    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
  >
    <option value="">Select Unit</option>
    {units.map((unit) => (
      <option key={unit} value={unit}>{unit}</option>
    ))}
  </select>
</div>

          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-green-700 disabled:opacity-60"
            >
              {editingId ? <Save size={18} /> : <CheckCircle size={18} />}
              {editingId ? 'Update Personnel' : 'Add Personnel'}
            </button>
            {editingId && (
<button
  type="button"
  onClick={() => {
    setEditingId(null);
    setFormData({ profile: null, fullName: '', email: '', contact: '', position: '', unit: '' });
    setExistingProfile(null);
    if (preview && typeof preview === 'string' && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);

    // ✅ Reset file input field
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }}
  className="bg-gray-200 px-3 py-2 rounded-2xl"
>
  Cancel
</button>
            )}
          </div>
        </form>
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-green-700">Personnel List</h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-80"
              />
              <button onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }} className="px-3 py-2 bg-gray-100 rounded-md">Clear</button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm font-medium">Sort By</label>
              <select value={sortByControl} onChange={(e) => setSortByControl(e.target.value)} className="border rounded-md px-2 py-1">
                <option value="id">ID</option>
                <option value="fullName">Full Name</option>
                <option value="email">Email</option>
                <option value="contact">Contact</option>
                <option value="position">Position</option>
                <option value="unit">Unit</option>
              </select>
              <select value={sortOrderControl} onChange={(e) => setSortOrderControl(e.target.value)} className="border rounded-md px-2 py-1">
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <button onClick={applySortControl} className="px-3 py-1 bg-green-100 rounded-md hover:bg-green-200">Apply</button>
              <button onClick={() => { setSortField('fullName'); setSortAsc(true); }} className="px-3 py-1 bg-gray-100 rounded-md">Reset Sort</button>
              <button onClick={() => window.print()} className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-md hover:bg-green-200">
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-green-100">
                {headers.map((h, idx) => (
                  <th
                    key={idx}
                    className={`border px-3 sm:px-4 py-2 text-left ${h.field ? 'cursor-pointer' : ''}`}
                    onClick={() => h.field && handleSort(h.field)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base">{h.label}</span>
                      {h.field && sortField === h.field && <span className="ml-2 text-xs">{sortAsc ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedList.map((person) => (
                <tr key={person.id} className="hover:bg-green-50">
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.id}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.fullName}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.email}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.contact}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.position}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words">{person.unit}</td>
                  <td className="border px-3 sm:px-4 py-2 align-top whitespace-normal break-words flex gap-2">
                    <button onClick={() => handleEdit(person)} className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md hover:bg-blue-200">
                      <Edit size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(person.id)} className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md hover:bg-red-200">
                      <Trash size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedList.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="text-center py-4 text-gray-500">No personnel found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md z-50"
          >
            Personnel saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
