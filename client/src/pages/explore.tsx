import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillCard from "@/components/skills/skill-card";
import { Search } from "lucide-react";
import { Skill } from "@shared/schema";

const Explore: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: skills, isLoading } = useQuery<(Skill & { user: any })[]>({
    queryKey: ["/api/skills"],
  });

  // Filter skills based on search term and category
  const filteredSkills = skills ? skills.filter((skill: Skill & { user: any }) => {
    const matchesSearch = 
      searchTerm === "" || 
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === "all" || 
      skill.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Skills
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find the perfect match for your skill exchange
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search skills, tags, or descriptions..."
              className="pl-10 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveCategory}>
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="devops">DevOps</TabsTrigger>
              <TabsTrigger value="data science">Data Science</TabsTrigger>
            </TabsList>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10 mt-6">
              <p className="text-gray-500">Loading skills...</p>
            </div>
          ) : filteredSkills?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
              {filteredSkills.map((skill: Skill & { user: any }) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 mt-6">
              <p className="text-gray-500">No skills found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
