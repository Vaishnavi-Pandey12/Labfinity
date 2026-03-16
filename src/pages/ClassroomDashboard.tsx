import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Eye, UserPlus, CheckCircle2, XCircle, AlertCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Classroom {
  id: number;
  class_name: string;
  subject: string;
  join_code: string;
  created_at: string;
  student_count: number;
  faculty_name: string;
}

interface EnrolledStudent {
  student_id: number;
  name: string;
  email: string;
  registration_no: string | null;
  joined_at: string | null;
}

interface AddResult {
  email: string;
  status: "added" | "already_enrolled" | "not_found" | "not_a_student";
  name?: string;
}

const ClassroomDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  // Create classroom dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);

  // Join classroom dialog (students)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Add students dialog
  const [addStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false);
  const [addStudentsClassroomId, setAddStudentsClassroomId] = useState<number | null>(null);
  const [emailsInput, setEmailsInput] = useState("");
  const [addingStudents, setAddingStudents] = useState(false);
  const [addResults, setAddResults] = useState<AddResult[] | null>(null);

  // View students dialog
  const [viewStudentsDialogOpen, setViewStudentsDialogOpen] = useState(false);
  const [viewStudentsClassroomId, setViewStudentsClassroomId] = useState<number | null>(null);
  const [viewStudentsClassroomName, setViewStudentsClassroomName] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch classrooms", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    if (!className.trim() || !subject.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class_name: className, subject }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Classroom created successfully" });
        setCreateDialogOpen(false);
        setClassName("");
        setSubject("");
        fetchClassrooms();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail || "Failed to create classroom", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const joinClassroom = async () => {
    if (!joinCode.trim()) {
      toast({ title: "Error", description: "Please enter a join code", variant: "destructive" });
      return;
    }
    setJoining(true);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ join_code: joinCode }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Successfully joined classroom" });
        setJoinDialogOpen(false);
        setJoinCode("");
        fetchClassrooms();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail || "Failed to join classroom", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  // ── Add Students ──
  const openAddStudents = (classroomId: number) => {
    setAddStudentsClassroomId(classroomId);
    setEmailsInput("");
    setAddResults(null);
    setAddStudentsDialogOpen(true);
  };

  const handleAddStudents = async () => {
    if (!emailsInput.trim() || !addStudentsClassroomId) return;

    // Parse emails: split by comma or newline, trim, filter empties
    const emails = emailsInput
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) {
      toast({ title: "Error", description: "Please enter at least one email", variant: "destructive" });
      return;
    }

    setAddingStudents(true);
    setAddResults(null);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch(`/api/classrooms/${addStudentsClassroomId}/add-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emails }),
      });

      if (response.ok) {
        const data = await response.json();
        setAddResults(data.results);
        toast({
          title: "Done",
          description: `${data.added} student(s) added. Total enrolled: ${data.student_count}`,
        });
        fetchClassrooms(); // refresh counts
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail || "Failed to add students", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setAddingStudents(false);
    }
  };

  // ── View Enrolled Students ──
  const openViewStudents = async (classroomId: number, classroomName: string) => {
    setViewStudentsClassroomId(classroomId);
    setViewStudentsClassroomName(classroomName);
    setEnrolledStudents([]);
    setViewStudentsDialogOpen(true);
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("labfinity_token");
      const response = await fetch(`/api/classrooms/${classroomId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setEnrolledStudents(await response.json());
      }
    } catch {
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } finally {
      setLoadingStudents(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "added":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "already_enrolled":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "added":
        return "Added";
      case "already_enrolled":
        return "Already enrolled";
      case "not_found":
        return "Email not found";
      case "not_a_student":
        return "Not a student account";
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <Home className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">Classroom Dashboard</h1>
          </div>

          {/* Faculty: Create */}
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
                  <DialogDescription>Enter the details for the new classroom.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="className">Class Name</Label>
                    <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Enter class name" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject" />
                  </div>
                  <Button onClick={createClassroom} disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Create Classroom"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Student: Join */}
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
                  <DialogDescription>Enter the join code provided by your faculty.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Join Code</Label>
                    <Input id="joinCode" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter join code" />
                  </div>
                  <Button onClick={joinClassroom} disabled={joining} className="w-full">
                    {joining ? "Joining..." : "Join Classroom"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Classroom cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <Card
              key={classroom.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                navigate(
                  `/classroom/${classroom.id}?name=${encodeURIComponent(classroom.class_name)}&subject=${encodeURIComponent(classroom.subject)}`
                )
              }
            >
              <CardHeader>
                <CardTitle>{classroom.class_name}</CardTitle>
                <CardDescription>{classroom.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.role === "student" && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Teacher: <span className="font-medium text-foreground">{classroom.faculty_name}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  <span>{classroom.student_count} students</span>
                </div>
                {user?.role === "faculty" && (
                  <div className="text-xs text-muted-foreground mb-4 font-mono bg-muted/50 px-2 py-1 rounded">
                    Join Code: <span className="font-bold select-all">{classroom.join_code}</span>
                  </div>
                )}
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

      {/* ── Add Students Dialog ── */}
      <Dialog open={addStudentsDialogOpen} onOpenChange={setAddStudentsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Students</DialogTitle>
            <DialogDescription>
              Enter student email IDs separated by commas or new lines (up to 100).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailsInput">Student Emails</Label>
              <Textarea
                id="emailsInput"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                placeholder={"student1@vitapstudent.ac.in, student2@vitapstudent.ac.in\nstudent3@vitapstudent.ac.in"}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleAddStudents} disabled={addingStudents} className="w-full">
              {addingStudents ? "Adding..." : "Add Students"}
            </Button>

            {/* Results */}
            {addResults && addResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {addResults.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 text-sm">
                    {statusIcon(r.status)}
                    <span className="font-mono text-xs flex-1 truncate">{r.email}</span>
                    <span
                      className={`text-xs font-medium ${r.status === "added"
                        ? "text-green-600"
                        : r.status === "already_enrolled"
                          ? "text-yellow-600"
                          : "text-red-500"
                        }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Students Dialog ── */}
      <Dialog open={viewStudentsDialogOpen} onOpenChange={setViewStudentsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrolled Students — {viewStudentsClassroomName}</DialogTitle>
            <DialogDescription>
              {enrolledStudents.length} student(s) enrolled
            </DialogDescription>
          </DialogHeader>
          {loadingStudents ? (
            <div className="py-8 text-center text-muted-foreground">Loading students...</div>
          ) : enrolledStudents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No students enrolled yet.</div>
          ) : (
            <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                <span>#</span>
                <span>Name</span>
                <span>Email</span>
              </div>
              {enrolledStudents.map((s, idx) => (
                <div key={s.student_id} className="grid grid-cols-[auto_1fr_1fr] gap-2 px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
                  <span className="text-muted-foreground">{idx + 1}</span>
                  <span className="font-medium truncate">{s.name}</span>
                  <span className="font-mono text-xs text-muted-foreground truncate">{s.email}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassroomDashboard;