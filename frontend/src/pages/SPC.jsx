// src/pages/History.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaBullseye,
  FaChalkboardTeacher,
  FaCross,
  FaHandsHelping,
  FaLightbulb,
  FaUsers,
  FaMedal,
  FaFlag,
} from "react-icons/fa";

export default function History() {
  // simplified animation variants
  const upVariant = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const downVariant = {
    hidden: { opacity: 0, y: -40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="space-y-20 p-6 sm:p-12">
      {/* Brief History */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 
                   p-10 sm:p-14 rounded-3xl shadow-2xl border border-yellow-300 
                   max-w-6xl mx-auto w-full relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-200 rounded-full opacity-40 blur-2xl"></div>
        <h2 className="text-4xl sm:text-5xl font-serif flex items-center gap-4 text-green-900">
          <FaBookOpen className="text-yellow-600 drop-shadow-md" /> Brief
          History of the San Pablo Colleges
        </h2>
        <div className="mt-8 text-gray-800 leading-relaxed text-justify space-y-6 text-lg sm:text-xl">
          <p className="font-bold text-2xl text-center text-green-900">
            Brief History of the San Pablo Colleges
          </p>
          <p>
            To meet the needs of the growing school-age population of the City of San
            Pablo and its neighboring towns, a group of pioneering men, among them Major
            Ricardo Bonilla, Dr. Antonio Azores, Mr. Ambrosio Alcantara, and many others
            founded and established the San Pablo Colleges in 1947. From its humble
            beginnings in makeshift rooms and rented buildings, the San Pablo Colleges in
            a brief span of five years acquired a one-half hectare piece of the walled
            lot at Hermanos Belen Street, in the heart of the City of San Pablo. Dr.
            Antonio Azores was its first President. It was during Dr. Alip’s tenure that
            full government recognition was granted to the Grade School, the Secondary
            School, and courses in Secretarial, Education, Commerce, Liberal Arts, and
            Law.
          </p>
          <p>
            However, it was in the middle 1950s that the San Pablo Colleges began to
            build its prestige in becoming one of the notable institutions in this part
            of the country, and it was also at this time that a comprehensive building
            program was undertaken. Judge Paulo de Gala Macasaet, considered the father
            of this Golden Era of Renaissance, was Chairman of the board of Trustees and
            later College President. During his time the Graduate Institute and the
            Nursing Course were successively recognized, which then inspired him in
            coming up with the objective: A school that would be second to none.
          </p>
          <p>
            This quest for educational excellence initiated by Judge Macasaet is now the
            very goal pursued by his successors. The present leadership has embarked on
            programs seeking the accreditation of its course and has been continuously
            searching on how the teaching-learning process will not only be effective and
            efficient but relevant as well. As everyone knows education is ever-growing
            and there is no end to its progress. Every generation shall have its
            contribution and for now, there is no substitute for the development of the
            College we all love and revere.
          </p>
        </div>
      </motion.div>

      {/* Other Sections */}
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Vision */}
        <motion.div
          variants={downVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white/90 border-l-8 border-green-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
        >
          <h2 className="text-3xl font-bold flex items-center gap-3 text-green-800">
            <FaBullseye className="text-green-600" /> Vision
          </h2>
          <p className="mt-4 text-gray-700 text-lg leading-relaxed">
            An excellent academic institution which nurtures diverse learners
            through relevant, innovative, and value-laden education.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          variants={upVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-green-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
        >
          <h2 className="text-3xl font-bold flex items-center gap-3 text-green-900 italic">
            <FaChalkboardTeacher className="text-green-600" /> Mission
          </h2>
          <p className="mt-4 text-gray-700 text-lg leading-relaxed">
            To develop the learners holistically and to transform them to be
            globally competitive professionals through quality instruction,
            research, and community engagement.
          </p>
        </motion.div>

        {/* Core Values */}
        <motion.div
          variants={downVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-green-800 mb-8 flex items-center gap-3">
            <FaUsers className="text-yellow-500" /> SPC Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: <FaCross />,
                title: "Faith",
                acronym: "F-aith",
                color: "bg-blue-50 border-l-4 border-blue-400",
                description:
                  "Fidelity to and being grounded in the faithfulness of God, realizing that there is more to life thereby committing their lives in the service of mankind and the salvation of souls.",
              },
              {
                icon: <FaHandsHelping />,
                title: "Stewardship",
                acronym: "S-tewardship",
                color: "bg-green-50 border-l-4 border-green-400",
                description:
                  "Willingness to shape services to meet the changing needs of all learners and stakeholders, thus making significant contributions to the larger community.",
              },
              {
                icon: <FaLightbulb />,
                title: "Passion for Learning",
                acronym: "P-assion for Learning",
                color: "bg-yellow-50 border-l-4 border-yellow-400",
                description:
                  "Strong and harmonious engagement among learners considers everyone as self-determined individuals who are capable of recreating themselves to improve teaching and learning.",
              },
              {
                icon: <FaUsers />,
                title: "Caring Community",
                acronym: "C-aring Community",
                color: "bg-pink-50 border-l-4 border-pink-400",
                description:
                  "Expression of genuine relationship between self and others, thus inspiring and sharing one's success and significance with the larger community beyond giving respect to the worth and dignity of all.",
              },
              {
                icon: <FaFlag />,
                title: "Sense of Pride",
                acronym: "S-ense of Pride",
                color: "bg-purple-50 border-l-4 border-purple-400",
                description:
                  "Delighting in one's success and continuously seeking challenging experiences, while enhancing feelings of pride and self-worth and staying connected and proud of being identified as an SPCian.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={i % 2 === 0 ? upVariant : downVariant}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={`${value.color} p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col gap-4`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl text-green-900">{value.icon}</div>
                  <div>
                    <h3 className="font-semibold text-xl">{value.title}</h3>
                    <p className="font-medium text-green-700">
                      {value.acronym}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Graduate Attributes */}
        <motion.div
          variants={upVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white/90 border-2 border-yellow-400 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
        >
          <h2 className="text-3xl font-bold flex items-center gap-3 text-yellow-700">
            <FaMedal className="text-yellow-500" /> Graduate Attributes
          </h2>

          <p className="mt-4 text-gray-700 text-lg leading-relaxed">
            Guided by this philosophy, SPC foresees a SPCian who shall achieve their
            full potential as a transformed graduate with:
          </p>

          <ul className="mt-6 space-y-3 text-gray-800 text-lg list-disc list-inside">
            <li className="font-semibold">
              SENSE OF HUMANISM AND NATIONHOOD
            </li>
            <li className="font-semibold">SPIRITUAL AND MORAL STRENGTH</li>
            <li className="font-semibold">PROFESSIONAL COMPETENCY</li>
            <li className="font-semibold">
              ACCOUNTABILITY AND SOCIAL RESPONSIBILITY
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
