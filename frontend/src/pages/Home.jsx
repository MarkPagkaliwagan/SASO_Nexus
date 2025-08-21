import React from "react";
import SPC from "../pages/SPC";
import SASO from "../pages/SASO";
import MainPanel from "../pages/MainPanel";

import "./home.css";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <MainPanel/>
      <SPC />
      <SASO />
    </div>
  );
}
