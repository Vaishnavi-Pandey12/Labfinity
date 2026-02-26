import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API = "http://localhost:8000";

interface User {
    user_id: string;
    email: string;
    full_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    signUp: (fullName: string, email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

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
        setUser({ user_id: data.user_id, email: data.email, full_name: data.full_name });
    }, []);

    const signUp = useCallback(async (fullName: string, email: string, password: string) => {
        const res = await fetch(`${API}/api/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: fullName, email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Sign-up failed");
        }
        // After sign-up, sign them in automatically to get a token
        const loginRes = await fetch(`${API}/api/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!loginRes.ok) throw new Error("Auto sign-in after signup failed");
        const data = await loginRes.json();
        localStorage.setItem("labfinity_token", data.access_token);
        setToken(data.access_token);
        setUser({ user_id: data.user_id, email: data.email, full_name: data.full_name });
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
        <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
