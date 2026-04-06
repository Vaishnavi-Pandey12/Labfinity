import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  ChevronRight,
  GraduationCap,
  Users,
  BookOpen,
  LogOut,
  UserCircle,
  Mail,
  IdCard
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { ChatBot } from "@/components/ChatBot";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { subjects } from "@/lib/subjects";

const stats = [
  { icon: BookOpen, value: "120+", label: "Experiments" },
  { icon: Users, value: "10,000+", label: "Students" },
  { icon: GraduationCap, value: "6", label: "Disciplines" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background particles-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl lab-gradient-bg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold lab-gradient-text">Labfinity</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">
              Subjects
            </Link>
            <Link to="/experiments" className="text-muted-foreground hover:text-primary transition-colors">
              Experiments
            </Link>
            {user && (
              <Link to="/classroom" className="text-muted-foreground hover:text-primary transition-colors">
                Classroom
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <img
              src={vitapLogo}
              alt="VITAP University"
              className="h-10 object-contain"
            />
            {user ? (
              <div className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 hover:bg-muted/80 transition-colors">
                      <UserCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{user.username}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
                    <div className="bg-muted/50 p-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{user.username}</p>
                          <p className="text-xs text-muted-foreground capitalize">Role: {user.role || "student"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate" title={user.email}>{user.email}</span>
                      </div>
                      {user.registration_no && (
                        <div className="flex items-center gap-3 text-sm">
                          <IdCard className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-foreground truncate" title={user.registration_no}>{user.registration_no}</span>
                        </div>
                      )}
                      
                      <div className="pt-2 mt-2 border-t border-border/50">
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Link to="/login">
                <Button className="lab-gradient-bg text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Subjects Grid */}
      <main className="flex-1 flex flex-col justify-center py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Choose Your Subject
            </h2>
            <p className="text-muted-foreground text-lg">
              Select a discipline to explore virtual experiments
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject) => (
              <motion.div key={subject.id} variants={itemVariants}>
                <Link to={`/subjects/${subject.id}`}>
                  <Card className="group glass-card border-0 hover-lift cursor-pointer overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                          <subject.icon className="w-7 h-7 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-xl font-display mt-4">
                        {subject.name}
                      </CardTitle>
                      <CardDescription>{subject.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{subject.experiments} Experiments</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <ChatBot />

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg lab-gradient-bg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Labfinity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 VIT-AP University. All rights reserved.
          </p>
          <img src={vitapLogo} alt="VITAP" className="h-8 object-contain" />
        </div>
      </footer>
    </div>
  );
};

export default Home;
