import React, { useState } from "react";
import { motion } from "framer-motion";
import spcLogo from "../images/SPC.png";
import sasoLogo from "../images/SASO.png";

export default function MainPanelEdge({ backgroundUrl = "/images/campus-bg.jpg", tagline = "Committed to Student Development & Community Service" }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="relative w-full"> {/* Parent relative for global overlay */}
      {/* GLOBAL OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/20 pointer-events-none z-0" />

      {/* HERO - edge-to-edge, no side padding */}
      <header
        className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat z-10"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
        role="banner"
        aria-label="San Pablo Colleges - Student Affairs and Services Office hero"
      >
        {/* Soft vignette on top/bottom for very wide photos */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Content */}
        <motion.div
          className="relative w-full h-full flex flex-col items-center justify-center text-center z-10"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Logo group */}
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-12 mb-8 md:mb-10 lg:mb-12 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <img
              src={spcLogo}
              alt="SPC Logo"
              className="w-24 sm:w-32 md:w-44 lg:w-52 xl:w-64 object-contain drop-shadow-2xl"
            />

            <img
              src={sasoLogo}
              alt="SASO Logo"
              className="w-20 sm:w-28 md:w-40 lg:w-48 xl:w-60 object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Titles - intentionally BIG and responsive */}
          <div className="w-full px-0">
            <h1 className="font-[Merriweather] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] tracking-tight mb-4">
              SAN PABLO COLLEGES
            </h1>

            <h2 className="font-[Poppins] uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-white/95 leading-tight drop-shadow-[0_4px_22px_rgba(0,0,0,0.7)] mb-6">
              Student Affairs &amp; Services Office
            </h2>

            {/* Tagline and CTAs */}
            <p className="mx-auto text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 max-w-4xl leading-relaxed px-4">
              {tagline}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
<motion.a
  href="#history"
  onClick={(e) => {
    e.preventDefault();
    setShowHistory((prev) => !prev); // toggle
    const el = document.getElementById("history");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base md:text-lg font-semibold bg-emerald-500/95 text-white shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.98 }}
>
  {showHistory ? "Hide History" : "Read History"}
</motion.a>


            </div>

          </div>
        </motion.div>
      </header>

      {/* HISTORY SECTION */}
      <section
        id="history"
        className="relative w-full -mt-2 pt-8 pb-16 z-10"
        aria-label="Brief history of San Pablo Colleges"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-0">
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: showHistory ? 1 : 0, height: showHistory ? "auto" : 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <article className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 text-white/95">
              <h3 className="font-[Merriweather] text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Brief History of the San Pablo Colleges
              </h3>

              <div className="space-y-4 text-sm sm:text-base md:text-lg leading-relaxed text-white/90">
                <p>
                  To meet the needs of the growing school-age population of the City of San Pablo and its neighboring towns, a group of pioneering men, among them Major Ricardo Bonilla, Dr. Antonio Azores, Mr. Ambrosio Alcantara, and many others founded and established the San Pablo Colleges in 1947. From its humble beginnings in makeshift rooms and rented buildings, the San Pablo Colleges in a brief span of five years acquired a one-half hectare piece of the walled lot at Hermanos Belen Street, in the heart of the City of San Pablo. Dr. Antonio Azores was its first President. It was during Dr. Alip’s tenure that full government recognition was granted to the Grade School, the Secondary School, and courses in Secretarial, Education, Commerce, Liberal Arts, and Law.
                </p>

                <p>
                  However, it was in the middle 1950s that the San Pablo Colleges began to build its prestige in becoming one of the notable institutions in this part of the country, and it was also at this time that a comprehensive building program was undertaken. Judge Paulo de Gala Macasaet, considered the father of this Golden Era of Renaissance, was Chairman of the board of Trustees and later College President. During his time the Graduate Institute and the Nursing Course were successively recognized, which then inspired him in coming up with the objective: A school that would be second to none.
                </p>

                <p>
                  This quest for educational excellence initiated by Judge Macasaet is now the very goal pursued by his successors. The present leadership has embarked on programs seeking the accreditation of its course and has been continuously searching on how the teaching-learning process will not only be effective and efficient but relevant as well. As everyone knows education is ever-growing and there is no end to its progress. Every generation shall have its contribution and for now, there is no substitute for the development of the College we all love and revere.
                </p>
              </div>
            </article>
          </motion.div>
 {/* Arrow to expand */}
          {!showHistory && (
            <div className="mt-6 flex items-center justify-center">
              <motion.div
                className="cursor-pointer text-white/80"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                onClick={() => setShowHistory(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}