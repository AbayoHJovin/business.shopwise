
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import SubscriptionPlansSection from '@/components/landing/SubscriptionPlansSection';
import FAQSection from '@/components/landing/FAQSection';
import FooterSection from '@/components/landing/FooterSection';

const LandingPage = () => {
  const location = useLocation();
  
  // Handle hash navigation when the page loads
  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      // Remove the # character
      const id = location.hash.substring(1);
      
      // Find the element with the corresponding ID
      const element = document.getElementById(id);
      
      // If the element exists, scroll to it
      if (element) {
        // Wait a bit for the page to fully render
        setTimeout(() => {
          // Get the height of the navbar to offset the scroll position
          const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <section id="about">
          <AboutSection />
        </section>
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        <section id="plans">
          <SubscriptionPlansSection />
        </section>
        <section id="faq">
          <FAQSection />
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default LandingPage;
