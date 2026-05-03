import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);

CustomEase.create("fractalOut",     "M0,0 C0.16,1.08 0.3,1 1,1");
CustomEase.create("fractalIn",      "M0,0 C0.7,0 0.84,0 1,1");
CustomEase.create("militarySnap",   "M0,0 C0.4,0 0.2,1 1,1");

export { gsap, ScrollTrigger, TextPlugin, CustomEase };
