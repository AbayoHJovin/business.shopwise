
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    price: "Free",
    frequency: "",
    description: "Essential tools for small businesses to get started",
    features: [
      "Up to 50 products",
      "Up to 3 employees",
      "Basic inventory management",
      "Simple sales tracking",
      "Basic expense tracking",
      "Daily sales reports",
      "Standard dashboard views",
      "Email support"
    ],
    ctaText: "Get Started",
    popular: false
  },
  {
    name: "Weekly Premium",
    price: "2500 RWF",
    frequency: "per week",
    description: "Advanced features for growing businesses",
    features: [
      "Up to 200 products",
      "Up to 10 employees",
      "Advanced inventory management",
      "Detailed sales analytics",
      "Advanced expense tracking",
      "AI-powered business insights",
      "Business listing in shop directory",
      "Advanced dashboard filtering",
      "Priority email support",
      "Availability management"
    ],
    ctaText: "Get Started",
    popular: true
  },
  {
    name: "Monthly Premium",
    price: "8500 RWF",
    frequency: "per month",
    description: "Best value for established businesses",
    features: [
      "Up to 200 products",
      "Up to 10 employees",
      "Advanced inventory management",
      "Detailed sales analytics",
      "Advanced expense tracking",
      "AI-powered business insights",
      "Business listing in shop directory",
      "Advanced dashboard filtering",
      "Priority email support",
      "Availability management"
    ],
    ctaText: "Get Started",
    popular: false
  }
];

const SubscriptionPlansSection = () => {
  return (
    <section className="py-12 bg-gray-50" id="plans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Subscription Plans</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Choose the right plan for your business
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            From free basic tools to premium features with AI analytics and business directory listings. Premium plans include a 7-day free trial.
          </p>
        </div>

        <div className="mt-12 space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`flex flex-col rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'border-2 border-primary ring-2 ring-primary ring-opacity-50' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-primary px-4 py-1 text-center">
                  <p className="text-xs font-medium text-white uppercase">Most Popular</p>
                </div>
              )}
              <div className="bg-white px-6 py-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 text-center">{plan.name}</h3>
                  <div className="mt-4 flex justify-center">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-xl font-medium text-gray-500 self-end mb-1">{plan.frequency}</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 text-center">{plan.description}</p>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 px-6 py-8">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/dashboard">
                    <Button 
                      className={`w-full ${!plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlansSection;
