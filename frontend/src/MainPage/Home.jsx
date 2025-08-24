// src/pages/Home.jsx
import React from "react";
import SPC from "../MainPage/SPC";
import SASO from "../MainPage/SASO";
import MainPanel from "../MainPage/MainPanel";


export default function Home() {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <MainPanel />
      <SPC />
      <SASO />
    </main>
  );
}
