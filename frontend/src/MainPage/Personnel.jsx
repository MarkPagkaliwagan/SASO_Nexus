import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Printer, X } from "lucide-react";

const unitsOrder = [
  "Guidance Office",
  "Student Formation and Development Unit (SFDU)",
  "School Clinic",
  "Campus Ministry",
  "Sports Development Unit"
];

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

const Personnel = () => {
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPerson, setModalPerson] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    api.get("/personnel")
      .then(res => {
        setPersonnels(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("API Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const getProfileUrl = (profile, updatedAt) => {
    if (!profile) return `${window.location.origin}/placeholder.png`;

    let base = profile.startsWith("http")
      ? profile
      : `http://127.0.0.1:8000/${profile.startsWith("storage/") ? profile : "storage/" + profile}`;

    const v = updatedAt ? new Date(updatedAt).getTime() : 0;
    return `${base}?v=${v}`;
  };

  const sortedPersonnels = unitsOrder.map(unit => ({
    unit,
    members: personnels.filter(p => p.unit?.trim() === unit)
  }));

  const printSection = (unit) => {
    const sectionHTML = sectionRefs.current[unit]?.outerHTML;
    if (!sectionHTML) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${unit} - Personnel</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #166534; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
            .card { border: 2px solid #4ade80; border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          ${sectionHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    };
  };

  if (loading) return <p>Loading personnels...</p>;

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {sortedPersonnels.map(section => (
        <section
          key={section.unit}
          className="bg-white rounded-3xl p-6 shadow-xl transition-transform duration-300 hover:scale-[1.01]"
          ref={el => (sectionRefs.current[section.unit] = el)}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700">{section.unit}</h2>
            <button
              onClick={() => printSection(section.unit)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 hover:scale-105 transition-transform duration-300"
            >
              <Printer size={18} /> Print Section
            </button>
          </div>

          {section.members.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No personnels available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {section.members.map(member => (
                <div
                  key={member.id}
                  onClick={() => setModalPerson(member)}
                  className="cursor-pointer relative bg-white rounded-xl shadow-md p-5 transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:bg-green-50 border-2 border-green-400"
                >
                  <div className="flex justify-center mb-3">
                    <img
                      src={getProfileUrl(member.profile, member.updated_at)}
                      alt={member.fullName || "Profile"}
                      className="w-24 h-24 object-cover border-2 border-green-300 rounded-lg"
                    />
                  </div>
                  <h3 className="font-bold text-center text-lg text-gray-800">{member.fullName}</h3>
                  <p className="text-sm text-center text-gray-600">{member.position}</p>
                  <p className="text-xs text-center text-gray-500 mt-1">{member.email}</p>
                  <p className="text-xs text-center text-gray-500">{member.contact}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Full View Modal */}
      {modalPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 md:w-96 relative shadow-2xl">
            <button
              onClick={() => setModalPerson(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-4">
              <img
                src={getProfileUrl(modalPerson.profile, modalPerson.updated_at)}
                alt={modalPerson.fullName || "Profile"}
                className="w-32 h-32 object-cover border-2 border-green-300 rounded-lg"
              />
            </div>
            <h3 className="font-bold text-center text-xl text-gray-800">{modalPerson.fullName}</h3>
            <p className="text-sm text-center text-gray-600">{modalPerson.position}</p>
            <p className="text-xs text-center text-gray-500 mt-1">{modalPerson.email}</p>
            <p className="text-xs text-center text-gray-500">{modalPerson.contact}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;
