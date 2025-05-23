
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$9.99",
    frequency: "per month",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 50 products",
      "Up to 5 employees",
      "Basic expense tracking",
      "Daily sales reports",
      "Email support"
    ],
    ctaText: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$24.99",
    frequency: "per month",
    description: "Ideal for growing businesses with more needs",
    features: [
      "Up to 500 products",
      "Up to 20 employees",
      "Advanced expense tracking",
      "Detailed sales analytics",
      "Employee time tracking",
      "Priority email support",
      "Availability management"
    ],
    ctaText: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$49.99",
    frequency: "per month",
    description: "For established businesses with complex requirements",
    features: [
      "Unlimited products",
      "Unlimited employees",
      "Advanced expense categories",
      "Custom reports & analytics",
      "API access",
      "Multiple business locations",
      "Priority phone support",
      "Dedicated account manager"
    ],
    ctaText: "Contact Sales",
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
            We offer flexible plans to accommodate businesses of all sizes. Start with a 14-day free trial.
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
