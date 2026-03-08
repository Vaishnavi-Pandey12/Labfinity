import { useState, useEffect, useRef, useCallback } from "react";

// Google Identity script attaches itself to `window.google`.
// declare to please TypeScript since we reference it below.
declare global {
  interface Window {
    google?: any;
  }
}
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
  const { signIn, signUp, googleLogin, user } = useAuth();
  const hiddenGoogleButtonRef = useRef<HTMLDivElement>(null);

  // Already logged in — redirect to home
  if (user) {
    navigate("/home");
    return null;
  }

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  // Use a ref so the Google callback always calls the latest version
  const googleCallbackRef = useRef<(response: any) => void>();

  googleCallbackRef.current = async (response: any) => {
    console.log("Google callback triggered. Response:", response);
    
    setIsLoading(true);
    setErrorMsg("");
    
    // Handle both callback format and requestCredential format
    const credentialToken = response?.credential || response?.token;
    
    if (!credentialToken) {
      const errorMsg = response?.error || "No credential received from Google";
      console.error("Google auth error:", errorMsg);
      setErrorMsg(errorMsg);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Sending credential to backend...");
      await googleLogin(credentialToken);
      console.log("Login successful, redirecting...");
      navigate("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google login failed";
      console.error("Google login error details:", err);
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  // load the Google Identity Services script dynamically and initialize it
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID not set — Google login disabled");
      setErrorMsg("Google login configuration missing");
      return;
    }

    // If the script is already loaded, just initialize
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: any) => googleCallbackRef.current?.(res),
      });
      // Render the hidden Google button
      if (hiddenGoogleButtonRef.current) {
        window.google.accounts.id.renderButton(hiddenGoogleButtonRef.current, {
          type: "standard",
          size: "large",
          theme: "outline",
          text: "signin",
        });
      }
      setGoogleReady(true);
      console.log("Google SDK already loaded and initialized");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google SDK script loaded");
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res: any) => googleCallbackRef.current?.(res),
        });
        // Render the hidden Google button
        if (hiddenGoogleButtonRef.current) {
          window.google.accounts.id.renderButton(hiddenGoogleButtonRef.current, {
            type: "standard",
            size: "large",
            theme: "outline",
            text: "signin",
          });
        }
        setGoogleReady(true);
        console.log("Google SDK initialized successfully");
      } else {
        console.error("window.google?.accounts?.id not available after script load");
        setErrorMsg("Failed to initialize Google SDK");
      }
    };
    script.onerror = () => {
      console.error("Failed to load Google SDK script");
      setErrorMsg("Failed to load Google SDK");
    };
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch { }
    };
  }, [hiddenGoogleButtonRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          setErrorMsg("Please enter a username.");
          return;
        }
        await signUp(username.trim(), email, password);
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

              {/* Username — only for sign up */}
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-foreground font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-3 my-5"
            >
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-border/50" />
            </motion.div>

            {/* Google Sign-In Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border/50 bg-background/50 hover:bg-background/80 font-medium transition-all"
                onClick={() => {
                  if (!googleReady) {
                    setErrorMsg("Google SDK not loaded yet, please try again.");
                    return;
                  }
                  
                  console.log("Attempting to trigger Google authentication...");
                  try {
                    // Try to click the rendered Google button inside the hidden container
                    const container = hiddenGoogleButtonRef.current;
                    if (container) {
                      // Find the button element within the rendered Google button
                      const button = container.querySelector("button, [role='button']") as HTMLElement;
                      if (button) {
                        console.log("Found Google button, clicking it...");
                        button.click();
                      } else {
                        // Fallback: try to trigger using prompt
                        console.log("No button found, trying prompt...");
                        window.google?.accounts?.id?.prompt?.();
                      }
                    } else {
                      console.error("Hidden container not found");
                      setErrorMsg("Google button container not initialized");
                    }
                  } catch (err: any) {
                    const errorMsg = err?.message || "Failed to trigger Google sign-in";
                    console.error("Google sign-in error:", err);
                    setErrorMsg(errorMsg);
                  }
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </motion.div>

            {/* Hidden Google Sign-In Button Container */}
            <div
              ref={hiddenGoogleButtonRef}
              style={{ display: "none" }}
              className="google-button-container"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
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
