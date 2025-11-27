import React from "react";

import Header from "./Header";
 import HeroSection from "./Herosection";
 import Aboutus from "./Aboutus";
 import Howitwork from "./Howitwork";
 import Benefit from "./Benefit";
 import Contact from "./Contact";
 import Footer from "./Footer";

function Home() {
  return (
 <div className="home-container">


<Header />
 <HeroSection />
<Aboutus />
<Howitwork />
<Benefit />
<Contact /> 
<Footer />


    </div>
  );
}

export default Home;
