import { FC } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skill, User } from "@shared/schema";
import { Star } from "lucide-react";

interface SkillCardProps {
  skill: Skill & {
    user: User;
  };
  showConnectButton?: boolean;
  onConnect?: () => void;
}

const SkillCard: FC<SkillCardProps> = ({ 
  skill, 
  showConnectButton = false, 
  onConnect 
}) => {
  const [_, navigate] = useLocation();

  const handleCardClick = () => {
    navigate(`/skill/${skill.id}`);
  };

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConnect) {
      onConnect();
    }
  };

  return (
    <Card 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={skill.user.avatar} alt={skill.user.fullName} />
            <AvatarFallback>{skill.user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{skill.user.fullName}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              <span>{skill.user.rating || 5.0}</span>
              <span className="mx-1">•</span>
              <span>{skill.user.exchangeCount || 0} exchanges</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between">
            <h4 className="text-base font-semibold text-gray-900">{skill.title}</h4>
            <Badge
              className={
                skill.type === "offering"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
              }
            >
              {skill.type === "offering" ? "Offering" : "Seeking"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{skill.description}</p>
          <div className="mt-4 flex flex-wrap gap-1">
            {skill.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        {skill.type === "offering" && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-medium text-gray-500">Looking for:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* This would be populated with "seeking" skills from the same user */}
                  <Badge variant="outline" className="text-xs">
                    {skill.user.username === "michaelchen" 
                      ? "UI/UX Design" 
                      : skill.user.username === "sarahkim" 
                      ? "Front-end Development"
                      : skill.user.username === "davidwilson"
                      ? "Python & Data Science"
                      : "Mobile Development"
                    }
                  </Badge>
                </div>
              </div>
              {showConnectButton && (
                <Button 
                  size="sm"
                  onClick={handleConnectClick}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        )}
        {skill.type === "seeking" && showConnectButton && (
          <div className="mt-4 border-t border-gray-200 pt-4 flex justify-end">
            <Button 
              size="sm"
              onClick={handleConnectClick}
            >
              Connect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillCard;
