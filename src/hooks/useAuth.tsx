import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Use relative paths to leverage Vite proxy for backend requests
const API = "";

interface User {
    user_id: number;
    email: string;
    username: string;
    profile_picture?: string;
    role?: string;
    registration_no?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    signUp: (username: string, email: string, password: string, role?: string, registrationNo?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    googleLogin: (googleToken: string) => Promise<void>;
    signOut: () => Promise<void>;
}

type SignupPayload = {
    username: string;
    email: string;
    password: string;
    role: string;
    registration_no?: string;
};

type SignupResponse = {
    access_token?: string;
    user_id?: number;
    email?: string;
    username?: string;
    role?: string;
    registration_no?: string | null;
    detail?: string;
    message?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("labfinity_token");
        if (savedToken) {
            fetch(`${API}/api/me`, {
                headers: { Authorization: `Bearer ${savedToken}` },
            })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data) {
                        setToken(savedToken);
                        setUser(data);
                    } else {
                        localStorage.removeItem("labfinity_token");
                    }
                })
                .catch(() => localStorage.removeItem("labfinity_token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API}/api/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Sign-in failed");
        }
        const data = await res.json();
        localStorage.setItem("labfinity_token", data.access_token);
        setToken(data.access_token);
        setUser({ user_id: data.user_id, email: data.email, username: data.username, role: data.role, registration_no: data.registration_no });
    }, []);

    const signUp = useCallback(async (username: string, email: string, password: string, role: string = "student", registrationNo?: string) => {
        const body: SignupPayload = { username, email, password, role };
        if (registrationNo) body.registration_no = registrationNo;

        const signupUser = async (formData: SignupPayload): Promise<SignupResponse> => {
            try {
                const response = await fetch("http://localhost:8080/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const text = await response.text();
                let data: SignupResponse = {};

                if (text) {
                    try {
                        data = JSON.parse(text) as SignupResponse;
                    } catch {
                        data = { message: "Received an invalid response from the server." };
                    }
                }

                if (!response.ok) {
                    throw new Error(data.message || data.detail || "Sign-up failed");
                }

                return data;
            } catch (error) {
                console.error("Signup error:", error);
                throw error;
            }
        };

        const data = await signupUser(body);
        if (!data.access_token || !data.user_id || !data.email || !data.username) {
            throw new Error("Signup succeeded but returned incomplete account data.");
        }
        localStorage.setItem("labfinity_token", data.access_token);
        setToken(data.access_token);
        setUser({ user_id: data.user_id, email: data.email, username: data.username, role: data.role, registration_no: data.registration_no });
    }, []);

    const googleLogin = useCallback(async (googleToken: string) => {
        const res = await fetch(`${API}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: googleToken }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Google login failed");
        }
        const data = await res.json();
        localStorage.setItem("labfinity_token", data.access_token);
        setToken(data.access_token);
        setUser({
            user_id: data.user_id,
            email: data.email,
            username: data.username,
            profile_picture: data.profile_picture,
        });
    }, []);

    const signOut = useCallback(async () => {
        const savedToken = localStorage.getItem("labfinity_token");
        if (savedToken) {
            await fetch(`${API}/api/signout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${savedToken}` },
            }).catch(() => { });
        }
        localStorage.removeItem("labfinity_token");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, signUp, signIn, googleLogin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
