import { FC } from "react";
import { UserPlus, Search, RefreshCw } from "lucide-react";

const HowItWorks: FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">How It Works</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">Exchange skills in three simple steps</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Our skill exchange platform makes it easy to connect with others and grow your technical abilities.</p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Create Your Profile</h3>
              <p className="mt-2 text-base text-gray-500 text-center">Sign up and list the skills you can offer to others in the community.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Find Skill Matches</h3>
              <p className="mt-2 text-base text-gray-500 text-center">Browse or search for skills you want to learn and connect with potential matches.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Exchange & Learn</h3>
              <p className="mt-2 text-base text-gray-500 text-center">Schedule sessions to exchange knowledge and develop new skills together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
