import { authApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await storage.getItem("token");
      const storedUser = await storage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = (await authApi.signIn({ email, password })) as any;
    // Support both { success, data: { user, token } } and { user, token } response shapes
    const userData = response?.data?.user ?? response?.user;
    const newToken = response?.data?.token ?? response?.token;
    if (userData && newToken) {
      setUser(userData);
      setToken(newToken);
      await storage.setItem("token", newToken);
      await storage.setItem("user", JSON.stringify(userData));
    } else {
      const msg = response?.message ?? response?.error ?? "Sign in failed";
      throw new Error(typeof msg === "string" ? msg : "Sign in failed");
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    const response = (await authApi.signUp({ name, email, password })) as any;
    const userData = response?.data?.user ?? response?.user;
    const newToken = response?.data?.token ?? response?.token;
    if (userData && newToken) {
      setUser(userData);
      setToken(newToken);
      await storage.setItem("token", newToken);
      await storage.setItem("user", JSON.stringify(userData));
    } else {
      const msg = response?.message ?? response?.error ?? "Sign up failed";
      throw new Error(typeof msg === "string" ? msg : "Sign up failed");
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem("token");
    await storage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
