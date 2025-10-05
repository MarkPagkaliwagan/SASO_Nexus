import React from "react";
import { motion } from "framer-motion";
import { FaUniversity, FaLeaf } from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";

const cardHover = {
  hover: { scale: 1.03, y: -2, transition: { type: "spring", stiffness: 220, damping: 18 } },
};

export default function SanPabloCollegesDarkInlineLabel() {
  return (
    <div className="relative font-sans bg-emerald-900 text-white">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-0 space-y-12">

        {/* San Pablo Colleges Section */}
        <section className="space-y-6">
          <div className="text-center flex items-center justify-center gap-3 mb-4">
            <FaUniversity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              San Pablo Colleges
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={cardHover}
              whileHover="hover"
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaLeaf className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold uppercase tracking-wide">Vision</h2>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                An excellent academic institution which nurtures diverse learners through relevant,
                innovative, and value-laden education.
              </p>
            </motion.div>

            <motion.div
              variants={cardHover}
              whileHover="hover"
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <GiLaurelsTrophy className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold uppercase tracking-wide">Mission</h2>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                To develop the learners holistically and to transform them to be globally competitive
                professionals through quality instruction, research, and community engagement.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Student Affairs and Services Office */}
        <section className="space-y-6">
          <div className="text-center flex items-center justify-center gap-3 mb-4">
            <FaUniversity className="w-6 h-6 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Student Affairs and Services Office
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={cardHover}
              whileHover="hover"
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaLeaf className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold uppercase tracking-wide">Vision</h2>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                A support system committed to delivering high-quality and excellent school services
                based on the Christian Catholic outlook.
              </p>
            </motion.div>

            <motion.div
              variants={cardHover}
              whileHover="hover"
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <GiLaurelsTrophy className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold uppercase tracking-wide">Mission</h2>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                To provide students with activities that will enrich/enhance them into a total person
                inside and outside the classroom setting.
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}
