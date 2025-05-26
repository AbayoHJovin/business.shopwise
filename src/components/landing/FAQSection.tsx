
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is ShopWise?",
    answer: "ShopWise is a comprehensive business management platform designed to help small and medium-sized businesses manage their operations more efficiently. It includes features for product management, employee management, expense tracking, and sales analytics."
  },
  {
    question: "How do I get started with ShopWise?",
    answer: "Getting started is easy! Simply click the 'Get Started' button, create an account, and follow the guided setup process to configure your business profile. You can then begin adding products, employees, and tracking expenses right away."
  },
  {
    question: "Can I try ShopWise before subscribing?",
    answer: "Yes, we offer a 14-day free trial for all our subscription plans. This allows you to explore all the features and decide if ShopWise is the right fit for your business before committing to a subscription."
  },
  {
    question: "Is my data secure with ShopWise?",
    answer: "Absolutely. We take data security very seriously. ShopWise uses industry-standard encryption to protect your data, and we never share your information with third parties without your explicit consent."
  },
  {
    question: "Can I access ShopWise on my mobile device?",
    answer: "Yes, ShopWise is fully responsive and works on all devices including smartphones and tablets. This allows you to manage your business on the go."
  },
  {
    question: "How do I get support if I encounter issues?",
    answer: "We offer email support for all our plans, with priority support and phone support available for higher-tier plans. You can also access our comprehensive knowledge base and tutorial videos to help troubleshoot common issues."
  }
];

const FAQSection = () => {
  return (
    <section className="py-12 bg-white" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">FAQs</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Find answers to common questions about ShopWise.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
