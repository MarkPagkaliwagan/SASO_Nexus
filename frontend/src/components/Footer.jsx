import React from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
  hover: { scale: 1.05, y: -2, rotateX: 2, rotateY: 2, transition: { type: "spring", stiffness: 220, damping: 18 } },
};

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebook />, name: "Facebook", href: "#" },
    { icon: <FaInstagram />, name: "Instagram", href: "#" },
    { icon: <FaTwitter />, name: "Twitter", href: "#" },
  ];

  const learnMoreLinks = [
    { name: "History of SPC", href: "#" },
    { name: "Facilities", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Online Payment Method", href: "#" },
  ];

  return (
    <footer className="bg-emerald-900 text-white py-8 px-6 sm:px-8 lg:px-12 w-full ">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">

        {/* Left Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Media</h3>
          <ul className="space-y-1">
            {socialLinks.map((link, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={linkVariants}
                whileHover="hover"
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-emerald-500">{link.icon}</span>
                <a href={link.href} className="hover:underline text-sm sm:text-base">{link.name}</a>
              </motion.li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mt-4">Learn More</h3>
          <ul className="space-y-1">
            {learnMoreLinks.map((link, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={linkVariants}
                whileHover="hover"
                className="cursor-pointer"
              >
                <a href={link.href} className="hover:underline text-sm sm:text-base">{link.name}</a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right Column: Address + Map */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold">Address</h3>
          <p className="text-sm sm:text-base leading-relaxed mb-2">
            Hermanos Belen St., Barangay 3A,<br/>
            San Pablo City, Laguna, 4000
          </p>
          
          <div className="w-full h-36 md:h-48 rounded-lg overflow-hidden shadow-md">
            <iframe
              title="San Pablo Colleges Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3857.209882414402!2d121.32412721414626!3d14.06698218971681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8b74a2c1e85%3A0x1234567890abcdef!2sSan%20Pablo%20Colleges!5e0!3m2!1sen!2sph!4v1693247981234!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

      </div>

      <motion.div
        className="mt-6 text-center text-sm text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1 } }}
      >
        © 2025 San Pablo Colleges. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
