import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

const SuccessStories: FC = () => {
  const stories = [
    {
      quote: "I exchanged my UI design skills for backend development knowledge, and it completely transformed my career. Now I can build full-stack applications!",
      name: "Elena Rodriguez",
      role: "UI Designer & Full-stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      exchanged: ["UI Design", "Node.js"],
      time: "3 months ago"
    },
    {
      quote: "SkillSync helped me connect with a DevOps expert who taught me containerization in exchange for my mobile development expertise. Win-win!",
      name: "Marcus Johnson",
      role: "Mobile Developer",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      exchanged: ["React Native", "Docker"],
      time: "1 month ago"
    },
    {
      quote: "I was struggling with data visualization until I matched with a data scientist on SkillSync. I taught her web animation techniques in return!",
      name: "Thomas Lee",
      role: "Frontend Developer",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      exchanged: ["CSS Animation", "D3.js"],
      time: "2 months ago"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Success Stories</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">Learn from our community</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">See how people have grown their skills through exchange.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex items-center">
                  <Quote className="text-primary-200 h-8 w-8 mr-4" />
                  <p className="text-gray-500 italic">{story.quote}</p>
                </div>
                <div className="mt-6 flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={story.avatar} alt={story.name} />
                    <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-500">{story.role}</p>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2">Exchanged:</span>
                    <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                      {story.exchanged[0]}
                    </Badge>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                      {story.exchanged[1]}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{story.time}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
