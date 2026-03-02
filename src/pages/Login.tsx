import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Atom, Microscope, Eye, EyeOff, Beaker, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Already logged in — redirect to home
  if (user) {
    navigate("/home");
    return null;
  }

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your full name.");
          return;
        }
        await signUp(fullName.trim(), email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/home");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center particles-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <FlaskConical className="w-24 h-24 text-primary" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 opacity-20"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <Atom className="w-32 h-32 text-accent" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
        >
          <Microscope className="w-28 h-28 text-secondary" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-1/4 opacity-20"
          animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        >
          <Beaker className="w-20 h-20 text-primary" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-2xl lab-gradient-bg flex items-center justify-center glow-effect">
                <FlaskConical className="w-10 h-10 text-primary-foreground" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-display lab-gradient-text">
                Labfinity
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Virtual Laboratory Platform
              </CardDescription>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex rounded-xl overflow-hidden border border-border/50 bg-background/30"
            >
              <button
                type="button"
                onClick={() => { setMode("signin"); setErrorMsg(""); }}
                className={`flex-1 py-2 text-sm font-semibold transition-all ${mode === "signin"
                  ? "lab-gradient-bg text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMsg(""); }}
                className={`flex-1 py-2 text-sm font-semibold transition-all ${mode === "signup"
                  ? "lab-gradient-bg text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Sign Up
              </button>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name — only for sign up */}
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors pl-10"
                      required
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@vitap.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Error message */}
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {errorMsg}
                </motion.p>
              )}

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 lab-gradient-bg text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Atom className="w-5 h-5" />
                    </motion.div>
                  ) : mode === "signin" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              Reimagining Labs for the Future
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
