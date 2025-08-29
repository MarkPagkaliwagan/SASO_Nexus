// src/pages/Home.jsx
import React from "react";
import VM from "./VM";
import MainPanel from "../MainPage/MainPanel";
import SPCSASO from "../MainPage/SPCSASO";
import CampusImg from "../images/Campus.png";

export default function Home() {
  return (
    <main className="relative flex flex-col w-full min-h-screen">
      {/* Fixed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
        style={{ backgroundImage: `url(${CampusImg})` }}
      ></div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col w-full">
        <MainPanel />
        <VM />
        <SPCSASO />
      </div>
    </main>
  );
}
