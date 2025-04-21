import { FC } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertSkillSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extended schema for form validation
const skillFormSchema = insertSkillSchema.omit({ userId: true }).extend({
  tags: z.string().transform((val) => val.split(",").map((tag) => tag.trim())),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

interface SkillFormProps {
  defaultType?: 'offering' | 'seeking';
  onSuccess?: () => void;
}

const SkillForm: FC<SkillFormProps> = ({ defaultType = 'offering', onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: defaultType,
      category: "",
      tags: "",
    },
  });

  const onSubmit = async (data: SkillFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a skill.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/skills", data);
      
      toast({
        title: "Skill created",
        description: `Your ${data.type} skill has been created successfully.`,
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate queries to refresh skill lists
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: [`/api/skills?userId=${user.id}`] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Failed to create skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React Development, UI/UX Design" {...field} />
              </FormControl>
              <FormDescription>
                A concise title for your skill
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what you can offer or what you're looking to learn..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="offering">Offering</SelectItem>
                    <SelectItem value="seeking">Seeking</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="data science">Data Science</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="React, JavaScript, Redux"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comma-separated list of relevant technologies or skills
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Skill"}
        </Button>
      </form>
    </Form>
  );
};

export default SkillForm;
