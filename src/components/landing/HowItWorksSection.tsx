
const HowItWorksSection = () => {
  return (
    <section className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple steps to streamline your business
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Get started with BusinessHive in just a few simple steps and transform how you manage your business.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary">1</div>
                </div>
              </div>
              <div className="md:w-1/2 mt-4 md:mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
                <p className="mt-2 text-lg text-gray-500">
                  Sign up for a BusinessHive account and set up your business profile with basic information 
                  about your company.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:flex-row-reverse">
              <div className="md:w-1/2 md:pl-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary">2</div>
                </div>
              </div>
              <div className="md:w-1/2 mt-4 md:mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Add Your Products</h3>
                <p className="mt-2 text-lg text-gray-500">
                  Enter your product catalog with details like name, description, pricing, and stock levels. 
                  Upload product images to keep everything organized.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary">3</div>
                </div>
              </div>
              <div className="md:w-1/2 mt-4 md:mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Manage Your Team</h3>
                <p className="mt-2 text-lg text-gray-500">
                  Add employees, set roles, manage permissions, and track performance all from one 
                  centralized dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:flex-row-reverse">
              <div className="md:w-1/2 md:pl-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary">4</div>
                </div>
              </div>
              <div className="md:w-1/2 mt-4 md:mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Track Sales & Expenses</h3>
                <p className="mt-2 text-lg text-gray-500">
                  Record sales transactions, monitor revenue, and keep track of all your business expenses 
                  to maintain clear financial visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
