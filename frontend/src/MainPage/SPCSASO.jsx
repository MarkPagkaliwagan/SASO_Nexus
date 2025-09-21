import React from "react";
import { FaStar, FaHandsHelping, FaBook, FaUsers, FaPrayingHands, FaAward } from "react-icons/fa";

export default function SPCSASO({ backgroundUrl = "/images/campus-bg.jpg" }) {
  const coreValues = [
    { icon: <FaPrayingHands />, title: "Faith", text: "Fidelity to God, committing life in the service of mankind and the salvation of souls." },
    { icon: <FaHandsHelping />, title: "Stewardship", text: "Willingness to shape services to meet the changing needs of learners and stakeholders." },
    { icon: <FaBook />, title: "Passion for Learning", text: "Learners recreate themselves to improve teaching and learning." },
    { icon: <FaUsers />, title: "Caring Community", text: "Genuine relationships inspire and share success with the larger community." },
    { icon: <FaAward />, title: "Sense of Pride", text: "Delighting in one's success and staying proud of being an SPCian." },
  ];

  const sasoGoals = [
    { title: "1. Holistic Activities", text: "To organize holistic activities for the spiritual, intellectual, social, emotional, and physical development of the students." },
    { title: "2. Coordination", text: "To coordinate with academic departments in carrying out extra and co-curricular activities of students." },
    { title: "3. Evaluation", text: "To evaluate the effects of extra and co-curricular activities on students' development inside and outside the classroom." },
    { title: "4. Recommendations", text: "To recommend changes and improvements to students' extra and co-curricular activities." },
  ];

  return (
    <div
      className="relative font-sans text-white min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-0">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Left Column: SPC Core Values */}
          <div className="space-y-6">
            <h1 className="flex items-center gap-3 text-3xl font-bold mb-6">
              <FaStar className="w-6 h-6 text-emerald-400" />
              SPC Core Values
            </h1>
            {coreValues.map((item, i) => (
              <div key={i} className="bg-gray-800/60 p-6 rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <h2 className="text-xl font-semibold uppercase">{item.title}</h2>
                </div>
                <p className="text-white/90 text-base leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Right Column: SASO Goals */}
          <div className="space-y-6">
            <h1 className="flex items-center gap-3 text-3xl font-bold mb-6">
              <FaStar className="w-6 h-6 text-teal-400" />
              SASO Goals
            </h1>
            {sasoGoals.map((goal, i) => (
              <div key={i} className="bg-gray-800/60 p-6 rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h2 className="text-xl font-semibold mb-2">{goal.title}</h2>
                <p className="text-white/90 text-base leading-relaxed">{goal.text}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
