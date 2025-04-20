import { useEffect } from "react";

import MeetOurTeam from "./MeetOurTeam";

import GetInTouch from "./GetInTouch";
import Vision from "./Vision";
import { Helmet } from "react-helmet-async";

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      <Helmet>
        <title>BikeRental | About</title>
      </Helmet>
      <MeetOurTeam />
      <GetInTouch />
      <Vision />
    </div>
  );
};

export default About;
