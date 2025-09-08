import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: string;
  actionUrl?: string;
  completed: boolean;
}

export default function Tasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Task Completed!",
        description: `Earned ${data.reward} MTK tokens`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTaskAction = (task: Task) => {
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank');
      // Simulate task completion after opening link
      setTimeout(() => {
        completeTaskMutation.mutate(task.id);
      }, 2000);
    } else {
      completeTaskMutation.mutate(task.id);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconClass = "text-primary-foreground text-xl";
    switch (iconName) {
      case 'twitter':
        return <i className={`fab fa-twitter ${iconClass}`} />;
      case 'telegram':
        return <i className={`fab fa-telegram ${iconClass}`} />;
      case 'discord':
        return <i className={`fab fa-discord ${iconClass}`} />;
      case 'youtube':
        return <i className={`fab fa-youtube ${iconClass}`} />;
      case 'check':
        return <i className={`fas fa-check ${iconClass}`} />;
      default:
        return <i className={`fas fa-tasks ${iconClass}`} />;
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 pt-12 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-12 px-6">
      <div className="text-center py-4 mb-6">
        <h2 data-testid="page-title" className="text-2xl font-bold gradient-text mb-2">Available Tasks</h2>
        <p className="text-muted-foreground">Complete tasks to earn bonus MTK</p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="glass-card border-white/20" data-testid={`card-task-${task.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    task.completed 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-primary to-accent'
                  }`}>
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      getIconComponent(task.icon)
                    )}
                  </div>
                  <div>
                    <h3 data-testid={`text-task-title-${task.id}`} className="font-semibold">
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {task.completed ? (
                    <div>
                      <p className="text-green-400 font-semibold">Completed</p>
                      <p className="text-sm text-muted-foreground">+{task.reward} MTK</p>
                    </div>
                  ) : (
                    <div>
                      <p data-testid={`text-reward-${task.id}`} className="text-primary font-semibold">
                        +{task.reward} MTK
                      </p>
                      <Button
                        onClick={() => handleTaskAction(task)}
                        disabled={completeTaskMutation.isPending}
                        data-testid={`button-start-task-${task.id}`}
                        className="bg-primary text-primary-foreground px-4 py-1 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        {task.actionUrl ? (
                          <>
                            Start <ExternalLink className="w-3 h-3 ml-1" />
                          </>
                        ) : (
                          'Complete'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <Card className="glass-card border-white/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tasks text-2xl text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Tasks Available</h3>
              <p className="text-sm text-muted-foreground">
                Check back later for new tasks and earning opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
