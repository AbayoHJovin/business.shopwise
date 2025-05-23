import { useState, useEffect } from 'react';

type SectionId = 'about' | 'how-it-works' | 'plans' | 'faq';

export function useActiveSection(sectionIds: SectionId[], offset = 100) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    // Create an observer for each section
    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            // When the section is in view with the specified threshold
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          },
          {
            rootMargin: `-${offset}px 0px -${Math.floor(window.innerHeight / 2)}px 0px`,
            threshold: 0.1,
          }
        );
        
        observer.observe(element);
        observers.push(observer);
      }
    });
    
    // Cleanup function to disconnect all observers
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sectionIds, offset]);
  
  return activeSection;
}
