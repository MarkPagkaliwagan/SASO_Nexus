import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFileImage, FaVideo, FaBuilding, FaSave, FaEdit, FaTrash, FaBullhorn } from "react-icons/fa";

const departments = [
  "Guidance Office",
  "Student Formation and Development Unit (SFDU)",
  "School Clinic",
  "Campus Ministry",
  "Sports Development Unit",
];

// Updated sizes
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_VIDEO_SIZE = 8 * 1024 * 1024; // 8 MB

const AdminDepartment = () => {
  const [announcement, setAnnouncement] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setAnnouncement("");
    setDepartment(departments[0]);
    setImage(null);
    setVideo(null);
    setEditingId(null);
  };

  const validateImage = (file) => {
    if (!file) return true;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Invalid image type. Allowed: JPG, PNG, GIF, WEBP");
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert("❌ Image too large! Max 2 MB");
      return false;
    }
    return true;
  };

  const validateVideo = (file) => {
    if (!file) return true;
    const validTypes = ["video/mp4", "video/mov", "video/avi"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Invalid video type. Allowed: MP4, MOV, AVI");
      return false;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      alert("❌ Video too large! Max 8 MB");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!announcement.trim()) return alert("Announcement cannot be empty");
    if (image instanceof File && !validateImage(image)) return;
    if (video instanceof File && !validateVideo(video)) return;

    const formData = new FormData();
    formData.append("announcement", announcement);
    formData.append("department", department);
    if (image instanceof File) formData.append("image", image);
    if (video instanceof File) formData.append("video", video);

    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        formData.append("_method", "PUT");
        await axios.post(
          `http://127.0.0.1:8000/api/announcements/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Announcement updated!");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/announcements",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("🚀 Announcement posted!");
      }
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err.response || err);
      alert("❌ Failed to submit announcement");
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id);
    setAnnouncement(a.announcement);
    setDepartment(a.department);
    setImage(a.image || null);
    setVideo(a.video || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete announcement");
    }
  };

return (
  <div className="max-w-7xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-xl border border-gray-300">
    <h2 className="text-4xl font-extrabold mb-12 text-gray-800 text-center flex items-center justify-center gap-3">
      <FaBullhorn /> Create & Preview Announcement
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg">
            📝 Announcement Details
          </label>
          <textarea
            className="w-full min-h-[180px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 text-lg bg-white text-gray-900"
            placeholder="Write your announcement here..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2">
            <FaBuilding /> Select Department
          </label>
          <select
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 text-lg bg-white text-gray-900"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2">
            <FaFileImage /> Upload an Image (Optional, Max 2 MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="mb-4 block w-full text-lg text-gray-700"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2">
            <FaVideo /> Upload a Video (Optional, Max 8 MB)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="mb-8 block w-full text-lg text-gray-700"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-semibold hover:bg-blue-700 transition duration-200 shadow-md flex items-center justify-center gap-3"
        >
          {editingId ? <><FaEdit /> Update Announcement</> : <><FaSave /> Post Announcement</>}
        </button>
      </div>

      {/* Live Preview */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          📄 Live Preview
        </h3>
        {(announcement || image || video) ? (
          <div className="p-6 border rounded-xl bg-gray-50 space-y-4">
            <div className="font-semibold mb-2 text-lg text-gray-900">{department}</div>
            <div
              className="mb-4 text-gray-700"
              dangerouslySetInnerHTML={{ __html: announcement.replace(/\n/g, "<br />") }}
            />
            {image && (
              <img
                src={image instanceof File ? URL.createObjectURL(image) : `http://127.0.0.1:8000/storage/${image}`}
                alt="Announcement"
                className="rounded-xl object-cover"
                style={{ width: image.width || 'auto', maxWidth: '100%' }}
              />
            )}
            {video && (
              <video
                src={video instanceof File ? URL.createObjectURL(video) : `http://127.0.0.1:8000/storage/${video}`}
                controls
                className="rounded-xl"
                style={{ width: video.width || 'auto', maxWidth: '100%' }}
              />
            )}
          </div>
        ) : (
          <p className="text-gray-400">Nothing to preview yet...</p>
        )}
      </div>
    </div>

    {/* Existing Announcements */}
    <div className="mt-16">
      <h3 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        🗂️ Existing Announcements
      </h3>
      <div className="flex flex-col gap-6">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden max-w-xl mx-auto"
          >
            {/* Media */}
            {a.image && (
              <img
                src={`http://127.0.0.1:8000/storage/${a.image}`}
                alt="Announcement"
                className="object-cover"
                style={{ width: a.imageWidth || 'auto', maxWidth: '100%' }}
              />
            )}
            {a.video && (
              <video
                src={`http://127.0.0.1:8000/storage/${a.video}`}
                controls
                className="object-cover"
                style={{ width: a.videoWidth || 'auto', maxWidth: '100%' }}
              />
            )}
            {/* Text Content */}
            <div className="p-4">
              <div className="font-semibold text-gray-800 mb-1">{a.department}</div>
              <div
                className="text-gray-700 text-sm line-clamp-3"
                dangerouslySetInnerHTML={{ __html: a.announcement.replace(/\n/g, "<br />") }}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(a)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition flex items-center gap-1 text-sm"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default AdminDepartment;
