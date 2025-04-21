import { FC, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Exchange, Message } from "@shared/schema";
import { Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const Messages: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExchange, setSelectedExchange] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  // Fetch user's exchanges
  const { data: exchanges, isLoading: isLoadingExchanges } = useQuery<(Exchange & { 
    initiator: any; 
    responder: any;
    initiatorSkill: any;
    responderSkill: any;
  })[]>({
    queryKey: ["/api/exchanges"],
    enabled: !!user,
  });

  // Fetch messages for the selected exchange
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/exchanges/${selectedExchange}/messages`],
    enabled: !!selectedExchange,
  });

  // Send a new message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedExchange) throw new Error("No exchange selected");
      return apiRequest("POST", `/api/exchanges/${selectedExchange}/messages`, { content });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/exchanges/${selectedExchange}/messages`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle message submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessage.mutate(messageText);
  };

  // Get the other user in the exchange
  const getOtherUser = (exchange: any) => {
    if (!user) return null;
    return exchange.initiator.id === user.id ? exchange.responder : exchange.initiator;
  };

  // Format date for messages
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">Please log in to view your messages.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exchange List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingExchanges ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : exchanges && exchanges.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  {exchanges.map((exchange) => {
                    const otherUser = getOtherUser(exchange);
                    if (!otherUser) return null;
                    
                    return (
                      <div key={exchange.id}>
                        <button
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                            selectedExchange === exchange.id ? "bg-gray-100" : ""
                          }`}
                          onClick={() => setSelectedExchange(exchange.id)}
                        >
                          <Avatar>
                            <AvatarImage src={otherUser.avatar} alt={otherUser.fullName} />
                            <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{otherUser.fullName}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {exchange.status}
                              <span className="mx-1">•</span>
                              {format(new Date(exchange.updatedAt), "MMM d")}
                            </p>
                          </div>
                        </button>
                        <Separator />
                      </div>
                    );
                  })}
                </ScrollArea>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No exchanges found.</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/explore"}>
                    Find Skills
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Chat Area */}
          <Card className="md:col-span-2">
            {selectedExchange ? (
              <>
                <CardHeader className="border-b">
                  {isLoadingExchanges ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                  ) : exchanges ? (
                    (() => {
                      const exchange = exchanges.find(e => e.id === selectedExchange);
                      if (!exchange) return <CardTitle>Select an exchange</CardTitle>;
                      
                      const otherUser = getOtherUser(exchange);
                      if (!otherUser) return <CardTitle>Select an exchange</CardTitle>;
                      
                      return (
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={otherUser.avatar} alt={otherUser.fullName} />
                            <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{otherUser.fullName}</CardTitle>
                            <p className="text-sm text-gray-500 capitalize">
                              Exchange status: {exchange.status}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : null}
                </CardHeader>
                
                <div className="flex flex-col h-[500px]">
                  <ScrollArea className="flex-grow p-4">
                    {isLoadingMessages ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                            <div className={`max-w-[80%] ${i % 2 === 0 ? "bg-primary-100" : "bg-gray-100"} rounded-lg p-3`}>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwnMessage = message.senderId === user.id;
                          
                          return (
                            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : ""}`}>
                              <div 
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isOwnMessage 
                                    ? "bg-primary-100 text-primary-900" 
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p>{message.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatMessageDate(message.createdAt.toString())}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={sendMessage.isPending}
                      />
                      <Button type="submit" size="icon" disabled={sendMessage.isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Select an exchange to view messages</p>
                  {!isLoadingExchanges && (!exchanges || exchanges.length === 0) && (
                    <Button variant="outline" onClick={() => window.location.href = "/explore"}>
                      Find Skills
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
