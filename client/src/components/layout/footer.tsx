import { FC } from "react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

const Footer: FC = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">SkillSync</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">About</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Mission</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Team</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Careers</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Guides</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Events</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Skills</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/explore?category=development">
                  <a className="text-base text-gray-500 hover:text-gray-900">Development</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?category=design">
                  <a className="text-base text-gray-500 hover:text-gray-900">Design</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?category=devops">
                  <a className="text-base text-gray-500 hover:text-gray-900">DevOps</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?category=data-science">
                  <a className="text-base text-gray-500 hover:text-gray-900">Data Science</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Support</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-base text-gray-500 hover:text-gray-900">Terms of Service</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="mt-8 mb-8" />
        
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-6 w-6" />
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6" />
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-6 w-6" />
              </a>
            </Link>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
