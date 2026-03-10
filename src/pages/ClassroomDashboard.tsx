import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Classroom {
  id: number;
  class_name: string;
  subject: string;
  join_code: string;
  created_at: string;
  student_count: number;
}

const ClassroomDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch classrooms",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    if (!className.trim() || !subject.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_name: className,
          subject: subject,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Classroom created successfully",
        });
        setCreateDialogOpen(false);
        setClassName("");
        setSubject("");
        fetchClassrooms();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to create classroom",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const joinClassroom = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          join_code: joinCode,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully joined classroom",
        });
        setJoinDialogOpen(false);
        setJoinCode("");
        fetchClassrooms();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to join classroom",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Classroom Dashboard</h1>
          {user?.role === "faculty" && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Classroom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Classroom</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new classroom.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="Enter class name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject"
                    />
                  </div>
                  <Button onClick={createClassroom} disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Create Classroom"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {user?.role === "student" && (
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Join Classroom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Classroom</DialogTitle>
                  <DialogDescription>
                    Enter the join code provided by your faculty to join the classroom.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Join Code</Label>
                    <Input
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter join code"
                    />
                  </div>
                  <Button onClick={joinClassroom} disabled={joining} className="w-full">
                    {joining ? "Joining..." : "Join Classroom"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <Card key={classroom.id}>
              <CardHeader>
                <CardTitle>{classroom.class_name}</CardTitle>
                <CardDescription>{classroom.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{classroom.student_count} students</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Students
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Classroom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {classrooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {user?.role === "faculty"
                ? "No classrooms created yet. Create your first classroom!"
                : "No classrooms joined yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomDashboard;