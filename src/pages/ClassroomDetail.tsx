import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    BookOpen,
    Brain,
    Users,
    BarChart3,
    UserPlus,
    Plus,
    Upload,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CalendarDays,
    FileText,
    Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";

type TabType = "classwork" | "quiz" | "people" | "grades";

/* ── Types ── */
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

interface MySubmission {
    id: number;
    file_url: string;
    submitted_at: string | null;
}

interface AssignmentItem {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    created_at: string | null;
    submission_count: number;
    my_submission: MySubmission | null;
}

/* ── Component ── */
const ClassroomDetail = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const isFaculty = user?.role === "faculty";

    const [activeTab, setActiveTab] = useState<TabType>("classwork");

    // Classroom meta from query params
    const params = new URLSearchParams(window.location.search);
    const classroomName = params.get("name") || "Classroom";
    const classroomSubject = params.get("subject") || "";

    // ── Classwork state ──
    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [creatingAssignment, setCreatingAssignment] = useState(false);

    // File upload refs per assignment
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    // ── People state ──
    const [students, setStudents] = useState<EnrolledStudent[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [emailsInput, setEmailsInput] = useState("");
    const [addingStudents, setAddingStudents] = useState(false);
    const [addResults, setAddResults] = useState<AddResult[] | null>(null);

    const tabs: { key: TabType; label: string; icon: React.ReactNode; show: boolean }[] = [
        { key: "classwork", label: "Classwork", icon: <BookOpen className="w-4 h-4" />, show: true },
        { key: "quiz", label: "Quiz", icon: <Brain className="w-4 h-4" />, show: true },
        { key: "people", label: "People", icon: <Users className="w-4 h-4" />, show: true },
        { key: "grades", label: "Grades", icon: <BarChart3 className="w-4 h-4" />, show: isFaculty },
    ];

    /* ── Data fetching ── */
    useEffect(() => {
        if (activeTab === "classwork" && classroomId) fetchAssignments();
        if (activeTab === "people" && classroomId) fetchStudents();
    }, [activeTab, classroomId]);

    const token = () => localStorage.getItem("labfinity_token");

    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const res = await fetch(apiUrl(`/api/classrooms/${classroomId}/assignments`), {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (res.ok) setAssignments(await res.json());
        } catch {
            toast({ title: "Error", description: "Failed to load classwork", variant: "destructive" });
        } finally {
            setLoadingAssignments(false);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const res = await fetch(apiUrl(`/api/classrooms/${classroomId}/students`), {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (res.ok) setStudents(await res.json());
        } catch {
            toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
        } finally {
            setLoadingStudents(false);
        }
    };

    /* ── Create Assignment (faculty) ── */
    const handleCreateAssignment = async () => {
        if (!newTitle.trim()) {
            toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
            return;
        }
        setCreatingAssignment(true);
        try {
            const res = await fetch(apiUrl(`/api/classrooms/${classroomId}/assignments`), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ title: newTitle.trim(), due_date: newDueDate || null }),
            });
            if (res.ok) {
                toast({ title: "Success", description: "Classwork created" });
                setCreateDialogOpen(false);
                setNewTitle("");
                setNewDueDate("");
                fetchAssignments();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.detail || "Failed", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        } finally {
            setCreatingAssignment(false);
        }
    };

    /* ── Submit file (student) ── */
    const handleFileUpload = async (assignmentId: number, file: File) => {
        setUploadingId(assignmentId);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(apiUrl(`/api/assignments/${assignmentId}/submit`), {
                method: "POST",
                headers: { Authorization: `Bearer ${token()}` },
                body: formData,
            });
            if (res.ok) {
                toast({ title: "Success", description: "File submitted!" });
                fetchAssignments();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.detail || "Upload failed", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        } finally {
            setUploadingId(null);
        }
    };

    /* ── Add students helpers ── */
    const handleAddStudents = async () => {
        if (!emailsInput.trim()) return;
        const emails = emailsInput.split(/[,\n]+/).map((e) => e.trim()).filter((e) => e.length > 0);
        if (emails.length === 0) return;
        setAddingStudents(true);
        setAddResults(null);
        try {
            const res = await fetch(apiUrl(`/api/classrooms/${classroomId}/add-students`), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ emails }),
            });
            if (res.ok) {
                const data = await res.json();
                setAddResults(data.results);
                toast({ title: "Done", description: `${data.added} student(s) added.` });
                fetchStudents();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.detail || "Failed", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        } finally {
            setAddingStudents(false);
        }
    };

    const statusIcon = (s: string) => {
        if (s === "added") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (s === "already_enrolled") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        return <XCircle className="w-4 h-4 text-red-500" />;
    };
    const statusLabel = (s: string) => {
        switch (s) {
            case "added": return "Added";
            case "already_enrolled": return "Already enrolled";
            case "not_found": return "Not found";
            case "not_a_student": return "Not a student";
            default: return s;
        }
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return "No due date";
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    /* ── Render ── */
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/classroom")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{classroomName}</h1>
                            {classroomSubject && <p className="text-sm text-muted-foreground">{classroomSubject}</p>}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4">
                        {tabs.filter((t) => t.show).map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.key
                                        ? "bg-background text-foreground border border-b-0 border-border"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab content */}
            <div className="container mx-auto px-6 py-6">
                {/* ═══════ CLASSWORK TAB ═══════ */}
                {activeTab === "classwork" && (
                    <div className="space-y-6">
                        {/* Faculty: Create button */}
                        {isFaculty && (
                            <div className="flex justify-end">
                                <Button onClick={() => { setNewTitle(""); setNewDueDate(""); setCreateDialogOpen(true); }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Classwork
                                </Button>
                            </div>
                        )}

                        {loadingAssignments ? (
                            <div className="py-12 text-center text-muted-foreground">Loading classwork...</div>
                        ) : assignments.length === 0 ? (
                            <Card>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-lg font-medium">No classwork yet</p>
                                        <p className="text-sm mt-1">
                                            {isFaculty
                                                ? "Create an assignment to get started."
                                                : "Your teacher hasn't posted any classwork yet."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((a) => (
                                    <Card key={a.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                        <h3 className="font-semibold text-lg">{a.title}</h3>
                                                    </div>
                                                    {a.description && (
                                                        <p className="text-sm text-muted-foreground ml-7 mb-2">{a.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 ml-7 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays className="w-3.5 h-3.5" />
                                                            Due: {formatDate(a.due_date)}
                                                        </span>
                                                        {isFaculty && (
                                                            <span className="flex items-center gap-1">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                {a.submission_count} submission(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Student: upload / status */}
                                                {!isFaculty && (
                                                    <div className="flex-shrink-0">
                                                        {a.my_submission ? (
                                                            <div className="text-right">
                                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Submitted
                                                                </span>
                                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                                                    {a.my_submission.submitted_at
                                                                        ? new Date(a.my_submission.submitted_at).toLocaleString("en-IN")
                                                                        : ""}
                                                                </p>
                                                                {/* Re-upload */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="mt-1 text-xs h-7"
                                                                    disabled={uploadingId === a.id}
                                                                    onClick={() => fileInputRefs.current[a.id]?.click()}
                                                                >
                                                                    Re-upload
                                                                </Button>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    ref={(el) => { fileInputRefs.current[a.id] = el; }}
                                                                    onChange={(e) => {
                                                                        const f = e.target.files?.[0];
                                                                        if (f) handleFileUpload(a.id, f);
                                                                        e.target.value = "";
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={uploadingId === a.id}
                                                                    onClick={() => fileInputRefs.current[a.id]?.click()}
                                                                >
                                                                    <Upload className="w-4 h-4 mr-1" />
                                                                    {uploadingId === a.id ? "Uploading..." : "Upload File"}
                                                                </Button>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    ref={(el) => { fileInputRefs.current[a.id] = el; }}
                                                                    onChange={(e) => {
                                                                        const f = e.target.files?.[0];
                                                                        if (f) handleFileUpload(a.id, f);
                                                                        e.target.value = "";
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════ QUIZ TAB ═══════ */}
                {activeTab === "quiz" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" /> Quizzes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">No quizzes yet</p>
                                <p className="text-sm mt-1">
                                    {isFaculty ? "Create quizzes to assess your students." : "No quizzes have been assigned yet."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ═══════ PEOPLE TAB ═══════ */}
                {activeTab === "people" && (
                    <div className="space-y-6">
                        {isFaculty && (
                            <div className="flex justify-end">
                                <Button onClick={() => { setEmailsInput(""); setAddResults(null); setAddDialogOpen(true); }}>
                                    <UserPlus className="w-4 h-4 mr-2" /> Add Students
                                </Button>
                            </div>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> Enrolled Students ({students.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingStudents ? (
                                    <div className="py-8 text-center text-muted-foreground">Loading...</div>
                                ) : students.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">No students enrolled yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/50">
                                                    <th className="text-left py-3 px-4 font-semibold">#</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Reg. No.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((s, idx) => (
                                                    <tr key={s.student_id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                                                        <td className="py-3 px-4 font-medium">{s.name}</td>
                                                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{s.email}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{s.registration_no || "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ═══════ GRADES TAB ═══════ */}
                {activeTab === "grades" && isFaculty && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" /> Grades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">No grades yet</p>
                                <p className="text-sm mt-1">Student grades will appear here once quizzes and assignments are graded.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ── Create Classwork Dialog ── */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Classwork</DialogTitle>
                        <DialogDescription>Enter a title and optional due date for the assignment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="assignmentTitle">Title</Label>
                            <Input
                                id="assignmentTitle"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. Lab Report – Experiment 3"
                            />
                        </div>
                        <div>
                            <Label htmlFor="assignmentDue">Due Date</Label>
                            <Input
                                id="assignmentDue"
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateAssignment} disabled={creatingAssignment} className="w-full">
                            {creatingAssignment ? "Creating..." : "Create Classwork"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Add Students Dialog ── */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Students</DialogTitle>
                        <DialogDescription>Enter student emails separated by commas or new lines (up to 100).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="emailsBulk">Student Emails</Label>
                            <Textarea
                                id="emailsBulk"
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
        </div>
    );
};

export default ClassroomDetail;
