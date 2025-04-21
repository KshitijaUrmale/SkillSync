import { FC } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const Hero: FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base lg:text-sm xl:text-base">
                Welcome to SkillSync
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-gray-900">Exchange Your</span>
                <span className="block text-primary">Technical Skills</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              No money needed - just exchange your knowledge and skills with others. Perfect for developers, designers, and tech enthusiasts looking to grow together.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <p className="text-base font-medium text-gray-900">
                Join our community and start sharing today
              </p>
              <div className="mt-3">
                {user ? (
                  <>
                    <Button 
                      onClick={() => navigate("/explore")}
                      size="lg"
                    >
                      Explore Skills
                    </Button>
                    <Button 
                      onClick={() => navigate(`/profile/${user.id}`)}
                      variant="outline" 
                      className="ml-3"
                      size="lg"
                    >
                      Your Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => navigate("/register")}
                      size="lg"
                    >
                      Get Started
                    </Button>
                    <Button 
                      onClick={() => navigate("/explore")}
                      variant="outline" 
                      className="ml-3"
                      size="lg"
                    >
                      Learn More
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full lg:max-w-md">
              <div className="relative block w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  className="w-full" 
                  src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="People collaborating on a laptop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Skills Exchange</p>
                    <p className="text-xs text-gray-300">Learn from each other</p>
                  </div>
                  <div className="flex -space-x-1 relative z-0">
                    <img className="relative z-30 inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                    <img className="relative z-20 inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                    <img className="relative z-10 inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="User" />
                    <span className="relative z-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 ring-2 ring-white">
                      <span className="text-xs font-medium text-white">+8</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
