import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const CTA: FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="bg-primary-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to grow your skills?</span>
          <span className="block text-primary-200">Join our community today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          {user ? (
            <div className="inline-flex rounded-md shadow">
              <Button 
                onClick={() => navigate("/explore")}
                className="bg-white text-primary-600 hover:bg-primary-50"
                size="lg"
              >
                Explore skills
              </Button>
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-md shadow">
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  size="lg"
                >
                  Get started
                </Button>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Button 
                  onClick={() => navigate("/explore")}
                  variant="secondary"
                  className="text-white bg-primary-600 hover:bg-primary-700"
                  size="lg"
                >
                  Learn more
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CTA;
