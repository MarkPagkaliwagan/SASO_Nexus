import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaClipboardList,
  FaGraduationCap,
  FaSchool,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../images/SPC.png";

// Program Images
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

// Programs & Courses Offered Data
const programs = [
  {
    name: "College of Arts and Sciences",
    img: CAS,
    details: ["BA COMMUNICATION", "BS PSYCHOLOGY", "AB POLITICAL SCIENCE", "AB ENGLISH"],
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
    details: ["Nursery (for children aged 4)", "Kindergarten (for children aged 5)", "Grades 1 to 6"],
  },
];

export default function Admission() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const toggleDetails = (index) => setExpandedIndex(expandedIndex === index ? null : index);
  const handleApplyClick = () => setShowModal(true);
  const handleNext = () => {
    if (agreed) window.open("/admission-form", "_blank");
    else alert("Please agree to the privacy notice before proceeding.");
  };

return (
  <div
    className="relative min-h-screen flex flex-col items-center p-4 sm:p-8 space-y-10 bg-fixed bg-cover bg-center"
    style={{
      backgroundImage: "url('/src/images/Campus2.jpg')", // palitan mo path ng pic mo
    }}
  >
    {/* overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#003332]/60 to-[#034C36]/90"></div>

    {/* main content */}
    <div className="relative z-10 w-full flex flex-col items-center space-y-10">

      
      {/* Programs & Courses Offered */}
<motion.h2
  className="text-3xl sm:text-4xl font-extrabold text-center text-white tracking-tight mb-4"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  🖥️ Online Admission Scheduling
</motion.h2>

<div className="max-w-4xl mx-auto mb-6">
  <p className="flex items-start text-gray-700 text-sm sm:text-base bg-green-50 border border-green-200 rounded-lg p-4">
    <FaClipboardList className="text-green-700 mr-2 mt-1" />
    After submitting your application form, you are required to pay 200 pesos at the cashier and bring Your receipts on the day of your scheduled exam. 
    This exam will be conducted onsite using a computer-based system.
  </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
  {programs.map((program, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => toggleDetails(index)}
      className={`flex flex-col items-center text-center border rounded-2xl p-6 shadow-md bg-white cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1
        ${expandedIndex === index
          ? "col-span-full bg-green-50 border-green-600 scale-[1.02] shadow-xl"
          : ""
        }`}
    >
      <img
        src={program.img}
        alt={program.name}
        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-4 transition-transform duration-500"
      />
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition w-full">
          <span className="font-semibold">{program.name}</span>
          <span>{expandedIndex === index ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>

        <AnimatePresence>
          {expandedIndex === index && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 p-4 rounded-lg w-full mt-3 overflow-hidden text-left"
            >
              <ul className="list-disc list-inside text-sm sm:text-base mb-4 whitespace-pre-line">
                {program.details.map((detail, i) => (
                  <li key={i} className="py-0.5 text-gray-700">
                    {detail}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
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
<motion.div
  className="w-full max-w-6xl p-6 rounded-2xl shadow-xl border border-yellow-300 bg-yellow-50 cursor-pointer transform perspective-1000 hover:scale-105 hover:rotate-1 hover:shadow-2xl transition-all duration-500"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ rotateY: 5, rotateX: 2 }}
  whileTap={{ scale: 0.98 }}
>
  <div className="relative z-10 space-y-6">
    <div className="flex items-center mb-4">
      <FaClipboardList className="text-yellow-600 text-3xl mr-2" />
      <h2 className="text-2xl sm:text-3xl font-bold text-yellow-900">
        Entrance Requirements
      </h2>
    </div>

    {/* Nested Cards */}
    {[
      {
        title: "For Freshmen",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>Applicants should take the SPC Admission Test (SPCAT).</li>
            <li>SPCAT Result</li>
            <li>Original and Photocopy of Form 138 (SHS Grade 12 Card)</li>
            <li>Original and Photocopy of Form 137 (JHS Grade 7-10 School Student Permanent Record)</li>
            <li>Four (4) I.D pictures (2" X 2") (Colored with white background and name tag)</li>
            <li>Certificate of Good Moral Character signed by SHS Principal/Guidance Counselor</li>
            <li>National Career Assessment Examination (NCAE) result if any</li>
            <li>PSA authenticated Birth Certificate. If not readable, submit the one issued by the Local Civil Registrar</li>
            <li>For female married applicant, submit a photocopy of the Marriage Contract (PSA authenticated)</li>
          </ul>
        ),
      },
      {
        title: "For Transferees",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>Applicants should take the SPC Admission Test (SPCAT).</li>
            <li>SPCAT Result</li>
            <li>Transfer Credential Form (Honorable Dismissal Form)</li>
            <li>Certification of Grades for evaluation purposes</li>
            <li>Original Transcript of Records with remark "Copy for San Pablo Colleges"</li>
            <li>Certification of Good Moral Character</li>
            <li>PSA authenticated Birth Certificate</li>
            <li>For female married applicant, submit a photocopy of the Marriage Contract (PSA authenticated)</li>
          </ul>
        ),
      },
      {
        title: "For Foreign Students",
        content: (
          <p className="text-yellow-800">
            Please refer to the leaflet for Foreign Students/Filipinos residing abroad from the Registrar's Office.
          </p>
        ),
      },
      {
        title: "For Juris Doctor Students",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>Applicants shall take the SPC College of Law Admission Test (SPCCLAT)</li>
            <li>Must have earned 18 units of English, 6 units of Math, 18 units of Social Science in bachelor's degree</li>
            <li>Certificate of General Weighted Average of 2.5 or 80% and above</li>
            <li>C-1 Certificate of Eligibility in the Law Course</li>
            <li>Certification of grades for evaluation purposes</li>
            <li>Original Transcript of Records with remark "Copy for San Pablo Colleges"</li>
            <li>PSA authenticated Birth Certificate</li>
            <li>For female married applicant, submit a photocopy of the Marriage Contract</li>
          </ul>
        ),
      },
      {
        title: "For Graduate School Students",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>MBA applicant: BSBA/BSA graduate; if not, take 18 units of Professional Business Education Subjects</li>
            <li>MA applicant: BSED/BEED graduate; if not, take 18 units of Professional Education Subjects + Photocopy of Valid PRC I.D (LET)</li>
            <li>MA in Guidance Counseling applicant: AB Psych, BS Psych, BSEd in Guidance and Counseling; if not, take 18 units Professional Subjects</li>
            <li>MAN applicant: Bachelor's degree in Nursing + Photocopy of Valid PRC I.D (NLE)</li>
            <li>EdD applicant: MA degree holder with Thesis; if not, subject to evaluation of unit requirement in Professional Education Subjects</li>
            <li>DBA applicant: MBA/MM degree holder with Thesis; if not, take MBA 113a (Position Paper)</li>
            <li>Interview by Dean of Graduate School</li>
            <li>Certification of Grades for evaluation purposes</li>
            <li>Original Transcript of Records with remark "Copy for San Pablo Colleges"</li>
            <li>PSA authenticated Birth Certificate</li>
          </ul>
        ),
      },
    ].map((section, idx) => (
      <motion.div
        key={idx}
        className="p-4 rounded-xl shadow-md border border-yellow-200 bg-yellow-100 hover:shadow-lg hover:bg-yellow-200 transition-all duration-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
        whileHover={{ scale: 1.02, rotateX: 1, rotateY: 1 }}
      >
        <h3 className="font-semibold text-yellow-900 mb-2">{section.title}</h3>
        {section.content}
      </motion.div>
    ))}
  </div>
</motion.div>

<motion.div
  className="w-full max-w-6xl p-6 rounded-2xl shadow-xl border border-yellow-300 bg-yellow-50 cursor-pointer transform perspective-1000 hover:scale-105 hover:rotate-1 hover:shadow-2xl transition-all duration-500"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ rotateY: 5, rotateX: 2 }}
  whileTap={{ scale: 0.98 }}
>
  <div className="relative z-10 space-y-6">
    <div className="flex items-center mb-4">
      <FaSchool className="text-yellow-600 text-3xl mr-2" />
      <h2 className="text-2xl sm:text-3xl font-bold text-yellow-900">
        On-site Registration Procedures
      </h2>
    </div>

    {/* Nested Cards */}
    {[
      {
        title: "Submission of Requirements",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>SHS Grade 12 Report Card</li>
            <li>Certificate of Good Moral Character</li>
            <li>Two (2) identical 2" X 2" colored pictures with white background with a name tag</li>
          </ul>
        ),
      },
      {
        title: "Screening and Entrance Exam",
        content: (
          <p className="text-yellow-800">
            All applicants who have complied with the admission requirements are screened by the concerned department before they are allowed to take the Entrance Examination. All applicants shall pay an admission fee at the Cashier's Office.
          </p>
        ),
      },
      {
        title: "Admission Kit",
        content: (
          <p className="text-yellow-800">
            After the payment of the admission fee, all applicants must secure the Admission Kit to the Admission Office which includes: two (2) Admission Forms, SPC Primer with Academic Information, and Admission and Enrollment Procedures.
          </p>
        ),
      },
      {
        title: "Admission Form & SPCAT",
        content: (
          <p className="text-yellow-800">
            All applicants shall accomplish the Admission Form in duplicate copies with two (2) identical 2" X 2" pictures to secure a schedule for the San Pablo Colleges Admission Test (SPCAT). The SPCAT is taken at the Guidance Unit, and results are available three days after the exam.
          </p>
        ),
      },
      {
        title: "Interview",
        content: (
          <p className="text-yellow-800">
            All applicants who complied with the enrollment requirements such as F-138, Certificate of Good Moral, and Examination Result shall be scheduled for an interview by the respective department deans.
          </p>
        ),
      },
      {
        title: "Basis for Admitting Students",
        content: (
          <ul className="list-disc list-inside ml-4 text-yellow-800">
            <li>Scholastic Standing - 33.33%</li>
            <li>Entrance Examination - 33.33%</li>
            <li>Interview Result - 33.33%</li>
          </ul>
        ),
      },
    ].map((section, idx) => (
      <motion.div
        key={idx}
        className="p-4 rounded-xl shadow-md border border-yellow-200 bg-yellow-100 hover:shadow-lg hover:bg-yellow-200 transition-all duration-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
        whileHover={{ scale: 1.02, rotateX: 1, rotateY: 1 }}
      >
        <h3 className="font-semibold text-yellow-900 mb-2">{section.title}</h3>
        {section.content}
      </motion.div>
    ))}
  </div>
</motion.div>


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
        className="bg-yellow-50 rounded-2xl p-6 max-w-xl w-full relative shadow-2xl cursor-pointer transform perspective-1000"
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02, rotateX: 1, rotateY: 1 }}
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-black hover:text-gray-700 transition-colors"
          onClick={() => setShowModal(false)}
        >
          <FaTimes size={22} />
        </button>

        {/* Logo and Title */}
        <motion.div
          className="flex flex-col items-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img src={Logo} alt="SAN PABLO COLLEGES" className="w-28 mb-3" />
          <h3 className="text-xl font-bold text-center text-black">
            SAN PABLO COLLEGES SASO Admission
          </h3>
        </motion.div>

        {/* Privacy Notice Text */}
        <motion.div
          className="text-sm text-black mb-4 max-h-72 overflow-y-auto space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>
            <strong>PRIVACY NOTICE:</strong> In accordance with the Data Privacy Act of 2012 (RA 10173), SAN PABLO COLLEGES is committed to protecting the privacy and security of your personal data. Any information you provide during the registration process will be collected, processed, and stored securely for legitimate academic and administrative purposes.
          </p>
          <p>
            By ticking the checkbox and submitting your registration, you consent to the use of your personal information for admission, enrollment, and communication purposes within the college. Your data will not be shared with unauthorized third parties, and only personnel authorized by SAN PABLO COLLEGES will have access to it.
          </p>
          <p>
            You have the right to access, correct, or request the deletion of your personal data in compliance with the law. By continuing with the registration process, you acknowledge that you have read, understood, and agreed to the SAN PABLO COLLEGES Privacy Notice.
          </p>
        </motion.div>

        {/* Checkbox */}
        <motion.div
          className="flex items-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mr-2 accent-yellow-500"
          />
          <label htmlFor="agree" className="text-black text-sm">
            I agree to the privacy notice
          </label>
        </motion.div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          className={`w-full text-white py-2 rounded-lg font-semibold transition-all duration-300 ${
            agreed
              ? "bg-yellow-700 hover:bg-yellow-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!agreed}
          whileHover={agreed ? { scale: 1.03 } : {}}
          whileTap={agreed ? { scale: 0.97 } : {}}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
        </div>

  );
}
