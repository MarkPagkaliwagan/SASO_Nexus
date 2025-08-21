import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Images
import GS from "../images/GS.png";
import JHS from "../images/JHS.png";
import SHS from "../images/SHS.png";
import CED from "../images/CED.png";
import CAS from "../images/CAS.png";
import CPT from "../images/CPT.png";
import CRT from "../images/CRT.png";
import CBM from "../images/CBM.png";
import CAC from "../images/CAC.png";
import CCS from "../images/CCS.png";
import CN from "../images/CN.png";
import Logo from "../images/SPC.png"; // your logo here

const programs = [
  {
    name: "College of Arts and Sciences",
    img: CAS,
    details: [
      "BA COMMUNICATION",
      "BS PSYCHOLOGY",
      "AB POLITICAL SCIENCE",
      "AB ENGLISH",
    ],
  },
  {
    name: "College of Education",
    img: CED,
    details: [
      "Bachelor of Early Childhood Education (BECed)",
      "Bachelor of Elementary Education (BEED) - Generalist",
      "Certificate in Teaching Program (CTP) (re-aligned) Area of Specialization:",
      "  - Music, Arts, Physical Education & Health (MAPEH)",
      "  - Physical Education (PE)",
      "Bachelor of Secondary Education (BSED) with Majors in:",
      "  - English  - Mathematics",
      "  - Filipino - Social Studies",
      "  - Science - Values Education",
      "Bachelor of Technology and Livelihood Education (BTLE) with Majors in:",
      "  - Home Economics",
      "  - Information and communication Technology (ICT)",
      "Bachelor of Science in Mathematics (BS Mathematics)",
      "Bachelor of Physical Education (BPED)",
      "Bachelor of Special Needs Education (BSNED)",
    ],
  },
  {
    name: "College of Physical Therapy",
    img: CPT,
    details: ["Bachelor of Science in Physical Therapy (BSPT)"],
  },
  {
    name: "College of Radiologic Technology",
    img: CRT,
    details: [
      "Bachelor of Science in Radiologic Technology (BSRT)",
      "Associate in Radiologic Technology (ARadTech - 3 years)",
    ],
  },
  {
    name: "College of Business and Management",
    img: CBM,
    details: [
      "Bachelor of Science in Business Administration (BSBA) with Majors in:",
      "  - Human Resources Management",
      "  - Marketing Management",
      "  - Financial Technology",
      "Bachelor of Science in Entrepreneurship (BS Entrep)",
      "Bachelor of Science in Public Administration (BS in PubAd)",
      "Bachelor of Science in Real Estate Management (BSREM)",
      "College of Hospitality and Management Courses:",
      "  - Bachelor of Science in Hospitality Management (BSHM)",
      "  - Associate in Hospitality and Management (AHM - 2 years)",
    ],
  },
  {
    name: "College of Accountancy",
    img: CAC,
    details: ["Bachelor of Science in Accountancy (BSA)"],
  },
  {
    name: "College of Computer Science",
    img: CCS,
    details: [
      "Bachelor of Science in Computer Science (BSCS)",
      "Bachelor of Science in Information Technology (BSIT)",
      "Associate in Computer Technology (ACT - 2 years)",
    ],
  },
  {
    name: "College of Nursing",
    img: CN,
    details: ["Bachelor of Science in Nursing (BSN)"],
  },
  {
    name: "Senior High School",
    img: SHS,
    details: [
      "Academic Track",
      "  - General Academic Strand",
      "  - Accountancy, Business and Management",
      "  - Science, Technology, Engineering and Mathematics",
      "  - Humanities and Social Sciences",
      "Technical Vocational and Livelihood Track",
      "  - Home Economics",
      "    - Bread and Pastry Production",
      "    - Cookery",
      "    - Food and Beverage Services",
      "Information and Communication Technology",
      "  - Computer Hardware Servicing",
      "  - Animation",
      "  - Computer Programming",
      "Arts and Design Track",
      "  - Performing Arts",
      "  - Art Production",
      "Sports Track",
    ],
  },
  {
    name: "Junior High School",
    img: JHS,
    details: [
      "Enhanced Basic Education Curriculum with Additional Elective Subjects",
      "  - Speech",
      "  - Journalism",
      "  - Computer",
      "  - Research",
      "  - Statistics",
    ],
  },
  {
    name: "Grade School",
    img: GS,
    details: [
      "Nursery (for children aged 4)",
      "Kindergarten (for children aged 5)",
      "Grades 1 to 6",
    ],
  },
];

export default function Admission() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const toggleDetails = (index) =>
    setExpandedIndex(expandedIndex === index ? null : index);

  const handleApplyClick = () => setShowModal(true);

  const handleNext = () => {
    if (agreed) {
      // Open AdmissionForm in a new tab
      window.open("/admission-form", "_blank");
    } else {
      alert("Please agree to the privacy notice before proceeding.");
    }
  };


  return (
    <div className="flex flex-col items-center p-6 min-h-screen">
      <motion.h2
        className="text-3xl font-bold mb-10 text-center text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Programs & Courses Offered
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-6xl">
        {programs.map((program, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => toggleDetails(index)}
            className={`flex flex-col sm:flex-row items-center text-center sm:text-left border rounded-lg p-4 shadow-md bg-white cursor-pointer transition-all duration-500
              ${
                expandedIndex === index
                  ? "sm:col-span-3 sm:justify-start sm:items-start scale-105 shadow-xl"
                  : "hover:scale-105 hover:shadow-lg"
              }`}
          >
            <img
              src={program.img}
              alt={program.name}
              className="w-28 h-28 object-contain mb-3 sm:mb-0 sm:mr-6 transition-all duration-500"
            />

            <div className="flex-1 w-full">
              <div className="flex items-center justify-center sm:justify-start bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded mb-3 transition w-full">
                <span className="font-semibold">{program.name}</span>
                <span className="ml-2">
                  {expandedIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-50 p-4 rounded w-full overflow-hidden"
                  >
                    <ul className="list-disc list-inside text-sm mb-4 whitespace-pre-line">
                      {program.details.map((detail, i) => (
                        <li key={i} className="py-0.5 text-gray-700">
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-all"
                      onClick={handleApplyClick}
                    >
                      Apply Now
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-xl w-full relative shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                onClick={() => setShowModal(false)}
              >
                <FaTimes size={20} />
              </button>
              <div className="flex flex-col items-center mb-4">
                <img src={Logo} alt="SAN PABLO COLLEGES" className="w-32 mb-2" />
                <h3 className="text-xl font-bold text-center">
                  SAN PABLO COLLEGES SASO Admission
                </h3>
              </div>
              <div className="text-sm text-gray-700 mb-4 max-h-60 overflow-y-auto">
                <p>
                  <strong>PRIVACY NOTICE:</strong> In pursuant with the Data Privacy Act of 2012
                  (RA 10173), SAN PABLO COLLEGES adheres to its principles in processing and
                  securing your information. By submitting your registration and ticking the box
                  below, you agree to the collection, use, disclosure, and processing of your
                  personal data for legitimate purposes. Rest assured your data is safe.
                </p>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="agree" className="text-gray-700 text-sm">
                  I agree to the privacy notice
                </label>
              </div>
              <button
                onClick={handleNext}
                className={`w-full ${
                  agreed
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white py-2 rounded font-semibold transition-all`}
                disabled={!agreed}
              >
                Next
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
