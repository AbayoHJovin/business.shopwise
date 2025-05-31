import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Store } from "lucide-react";
import { useActiveSection } from "@/hooks/useActiveSection";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const activeSection = useActiveSection([
    "about",
    "how-it-works",
    "plans",
    "faq",
  ]);

  // Only enable smooth scrolling on the landing page
  useEffect(() => {
    if (location.pathname === "/") {
      document.documentElement.style.scrollBehavior = "smooth";
    } else {
      document.documentElement.style.scrollBehavior = "auto";
    }

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    // Update URL with hash without causing a page reload
    window.history.pushState(null, "", `/#${sectionId}`);

    const element = document.getElementById(sectionId);
    if (element) {
      // Get the height of the navbar to offset the scroll position
      const navbarHeight = document.querySelector("nav")?.offsetHeight || 0;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Close mobile menu if open
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">ShopWise</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about");
              }}
              className={`text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-2 py-1 transition-all duration-200 ${
                activeSection === "about"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : ""
              }`}
              aria-current={activeSection === "about" ? "page" : undefined}
            >
              About Us
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className={`text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-2 py-1 transition-all duration-200 ${
                activeSection === "how-it-works"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : ""
              }`}
              aria-current={
                activeSection === "how-it-works" ? "page" : undefined
              }
            >
              How It Works
            </a>
            <a
              href="/#plans"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("plans");
              }}
              className={`text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-2 py-1 transition-all duration-200 ${
                activeSection === "plans"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : ""
              }`}
              aria-current={activeSection === "plans" ? "page" : undefined}
            >
              Subscription Plans
            </a>
            <a
              href="/#faq"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("faq");
              }}
              className={`text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-2 py-1 transition-all duration-200 ${
                activeSection === "faq"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : ""
              }`}
              aria-current={activeSection === "faq" ? "page" : undefined}
            >
              FAQs
            </a>
            <Link
              to="/businesses"
              className={`flex items-center text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-2 py-1 transition-all duration-200 ${
                location.pathname === "/businesses"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : ""
              }`}
            >
              <Store className="h-4 w-4 mr-1" />
              Discover Businesses
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="ml-4">
                Dashboard
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="ml-4">Get Started</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-primary"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about");
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-gray-50 ${
                activeSection === "about"
                  ? "text-primary bg-gray-50 font-bold"
                  : "text-gray-700"
              }`}
              aria-current={activeSection === "about" ? "page" : undefined}
            >
              About Us
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-gray-50 ${
                activeSection === "how-it-works"
                  ? "text-primary bg-gray-50 font-bold"
                  : "text-gray-700"
              }`}
              aria-current={
                activeSection === "how-it-works" ? "page" : undefined
              }
            >
              How It Works
            </a>
            <a
              href="/#plans"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("plans");
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-gray-50 ${
                activeSection === "plans"
                  ? "text-primary bg-gray-50 font-bold"
                  : "text-gray-700"
              }`}
              aria-current={activeSection === "plans" ? "page" : undefined}
            >
              Subscription Plans
            </a>
            <a
              href="/#faq"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("faq");
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-gray-50 ${
                activeSection === "faq"
                  ? "text-primary bg-gray-50 font-bold"
                  : "text-gray-700"
              }`}
              aria-current={activeSection === "faq" ? "page" : undefined}
            >
              FAQs
            </a>
            <Link
              to="/businesses"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-gray-50 ${
                location.pathname === "/businesses"
                  ? "text-primary bg-gray-50 font-bold"
                  : "text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store className="h-4 w-4 mr-2" />
              Discover Businesses
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="pt-2">
              <Link
                to="/signup"
                className="block w-full px-3 py-2 text-center rounded-md text-white bg-primary hover:bg-primary/90 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
