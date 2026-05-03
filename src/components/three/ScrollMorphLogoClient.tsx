"use client";

import dynamic from "next/dynamic";

const ScrollMorphLogo = dynamic(() => import("./ScrollMorphLogo"), {
  ssr: false,
});

export function ScrollMorphLogoClient() {
  return <ScrollMorphLogo />;
}
