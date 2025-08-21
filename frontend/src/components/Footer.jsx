import React from "react";

const Footer = () => {
  return (
    <footer className=" bg-[rgb(6,73,26)] text-white py-4 px-4 sm:px-6 lg:px-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-center sm:text-left text-sm sm:text-base">
          © {new Date().getFullYear()} My Company. All rights reserved.
        </p>
        <div className="mt-2 sm:mt-0 flex space-x-4">
          <a href="#" className="hover:underline text-sm sm:text-base">Privacy Policy</a>
          <a href="#" className="hover:underline text-sm sm:text-base">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
