import { FC } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skill as SkillType, User } from "@shared/schema";
import { Star, ArrowLeft } from "lucide-react";

const Skill: FC = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const skillId = parseInt(id);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch skill details
  const { data: skill, isLoading } = useQuery<SkillType & { user: User }>({
    queryKey: [`/api/skills/${skillId}`],
    enabled: !!skillId,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleConnect = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect with this skill owner.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // In a real app, this would open a modal to select which skill to offer in exchange
    toast({
      title: "Connect functionality",
      description: "In a full implementation, this would open a modal to select which of your skills to offer.",
    });
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center gap-4 mt-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : skill ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{skill.title}</CardTitle>
                  <div className="flex items-center mt-1">
                    <Badge
                      className={
                        skill.type === "offering"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      }
                    >
                      {skill.type === "offering" ? "Offering" : "Seeking"}
                    </Badge>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500 capitalize">{skill.category}</span>
                  </div>
                </div>
                {currentUser && skill.user.id !== currentUser.id && (
                  <Button onClick={handleConnect}>
                    Connect
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{skill.description}</p>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">Skill Owner</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={skill.user.avatar} alt={skill.user.fullName} />
                  <AvatarFallback>{skill.user.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{skill.user.fullName}</div>
                  <div className="text-sm text-gray-500">@{skill.user.username}</div>
                </div>
                <div className="ml-auto flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{skill.user.rating || 5.0}</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{skill.user.exchangeCount || 0} exchanges</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(`/profile/${skill.user.id}`)}
              >
                View Profile
              </Button>
              {currentUser && skill.user.id !== currentUser.id && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // This would navigate to direct messaging with the user
                    toast({
                      title: "Messaging functionality",
                      description: "This would open a direct message with the skill owner.",
                    });
                  }}
                >
                  Message
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Skill not found or has been removed.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate("/explore")}>
                Explore Other Skills
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Skill;
