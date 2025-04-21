import { FC } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import SkillCard from "@/components/skills/skill-card";
import SkillForm from "@/components/skills/skill-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { User, Skill } from "@shared/schema";
import { Star, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const Profile: FC = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const userId = parseInt(id);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user profile
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch user skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery<(Skill & { user: User })[]>({
    queryKey: [`/api/skills?userId=${userId}`],
    enabled: !!userId,
  });

  // For creating an exchange
  const createExchange = useMutation({
    mutationFn: async (data: { responderId: number; initiatorSkillId: number; responderSkillId: number }) => {
      return apiRequest("POST", "/api/exchanges", data);
    },
    onSuccess: () => {
      toast({
        title: "Exchange request sent!",
        description: "The user will be notified of your request.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send exchange request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter skills by type
  const offeringSkills = skills?.filter(skill => skill.type === 'offering') || [];
  const seekingSkills = skills?.filter(skill => skill.type === 'seeking') || [];

  // Handle exchange request
  const handleExchangeRequest = (responderSkillId: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to send exchange requests.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // First, find a matching skill that the current user offers
    const userOfferingSkills = queryClient.getQueryData<Skill[]>([`/api/skills?userId=${currentUser.id}&type=offering`]);
    
    if (!userOfferingSkills || userOfferingSkills.length === 0) {
      toast({
        title: "No offering skills",
        description: "You need to create at least one offering skill before requesting an exchange.",
        variant: "destructive",
      });
      return;
    }

    // For simplicity, we'll use the first offering skill, but in a real app
    // you'd want to let the user choose which skill to offer
    const initiatorSkillId = userOfferingSkills[0].id;

    createExchange.mutate({
      responderId: userId,
      initiatorSkillId,
      responderSkillId,
    });
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 flex flex-col items-center">
                {isLoadingUser ? (
                  <Skeleton className="h-24 w-24 rounded-full" />
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                {isLoadingUser ? (
                  <Skeleton className="h-6 w-24 mt-4" />
                ) : (
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{user?.rating || 5.0}</span>
                  </div>
                )}
                {isLoadingUser ? (
                  <Skeleton className="h-6 w-32 mt-2" />
                ) : (
                  <div className="text-sm text-gray-500 mt-1">
                    {user?.exchangeCount || 0} exchanges
                  </div>
                )}
                {!isOwnProfile && currentUser && (
                  <Button 
                    className="mt-4"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // In a real app, this would navigate to a chat/message page
                      toast({
                        title: "Message functionality",
                        description: "This feature would navigate to a direct message with this user.",
                      });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
              </div>
              
              <div className="flex-grow">
                {isLoadingUser ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                    <p className="text-sm text-gray-500 mb-4">@{user?.username}</p>
                    <p className="text-gray-700">{user?.bio || "No bio provided."}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Skills</h3>
          {isOwnProfile && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a New Skill</DialogTitle>
                </DialogHeader>
                <SkillForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="offering" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="offering">Offering</TabsTrigger>
            <TabsTrigger value="seeking">Seeking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offering">
            {isLoadingSkills ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : offeringSkills.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {offeringSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No offering skills found.</p>
                  {isOwnProfile && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-4" variant="outline">
                          Add Offering Skill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add an Offering Skill</DialogTitle>
                        </DialogHeader>
                        <SkillForm defaultType="offering" />
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="seeking">
            {isLoadingSkills ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : seekingSkills.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {seekingSkills.map((skill) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    showConnectButton={!isOwnProfile && !!currentUser}
                    onConnect={() => handleExchangeRequest(skill.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No seeking skills found.</p>
                  {isOwnProfile && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-4" variant="outline">
                          Add Seeking Skill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add a Seeking Skill</DialogTitle>
                        </DialogHeader>
                        <SkillForm defaultType="seeking" />
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
