import React from "react";
import { motion } from "framer-motion";
import { FaLightbulb, FaBullseye, FaFlag } from "react-icons/fa";

export default function Saso() {
  // Subtle transition variants
  const leftVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  const rightVariant = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  };

  const topVariant = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 text-gray-800">
      {/* Page Title */}
      <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        variants={topVariant}
        className="text-4xl md:text-5xl font-extrabold text-center text-green-700 drop-shadow-sm"
      >
        Student Affairs and Services Office
      </motion.h1>

      {/* Vision Panel - from left */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        variants={leftVariant}
        className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-8 border-yellow-500 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaBullseye className="text-3xl text-yellow-600" />
          <h2 className="text-2xl font-bold text-yellow-700">Vision</h2>
        </div>
        <p className="text-gray-700">
          A support system committed to delivering high-quality and excellent
          school services based on the Christian Catholic outlook.
        </p>
      </motion.section>

      {/* Mission Panel - from right */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        variants={rightVariant}
        className="bg-gradient-to-br from-green-50 to-yellow-50 border-l-8 border-green-500 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaLightbulb className="text-3xl text-green-600" />
          <h2 className="text-2xl font-bold text-green-700">Mission</h2>
        </div>
        <p className="text-gray-700">
          To provide students with activities that will enrich/enhance them into
          a total person inside and outside the classroom setting.
        </p>
      </motion.section>

      {/* Goals Panel - from left */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        variants={leftVariant}
        className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-8 border-yellow-500 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaFlag className="text-3xl text-yellow-600" />
          <h2 className="text-2xl font-bold text-yellow-700">Goals</h2>
        </div>
        <ul className="list-decimal list-inside space-y-2 pl-4 text-gray-700">
          <li>
            To organize holistic activities for the spiritual, intellectual,
            social, emotional, and physical development of the students.
          </li>
          <li>
            To coordinate with different academic departments in carrying out
            the extra and co-curricular activities of the students.
          </li>
          <li>
            To evaluate the effects of extra and co-curricular activities in
            relation to the students' development inside and outside the
            classroom setting.
          </li>
          <li>
            To recommend changes and improvement of the students’ extra and
            co-curricular activities.
          </li>
        </ul>

        {/* Additional Functions */}
        <div className="mt-4 text-gray-700 space-y-2">
          <p>To attain these goals, the OSA seeks to fulfill the following functions:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Spiritual Function – Encourages students to grow and mature with a community of believers.</li>
            <li>Health Function – Provides students with medical and dental information as well as services for proper health care.</li>
            <li>Counseling Function – Assists the students to become enlightened and self-actualized individuals.</li>
            <li>Leadership Function – Offers students opportunities for enhancement of their leadership and organizational skills.</li>
            <li>Orientation Function – Familiarizes students with the campus environment including students such academic and non-academic policies.</li>
            <li>Coordinating Function – Acts as links to the various extra and co-curricular activities for the holistic development of the students.</li>
          </ul>
        </div>
      </motion.section>
    </div>
  );
}
