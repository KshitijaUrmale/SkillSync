import { FC } from "react";
import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/how-it-works";
import FeaturedSkills from "@/components/home/featured-skills";
import SuccessStories from "@/components/home/success-stories";
import CTA from "@/components/home/cta";

const Home: FC = () => {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <FeaturedSkills />
      <SuccessStories />
      <CTA />
    </div>
  );
};

export default Home;
