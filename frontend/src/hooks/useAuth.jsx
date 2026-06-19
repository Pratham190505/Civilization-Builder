import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { login as apiLogin, logout as apiLogout, getProfile } from "../api/auth";
import { startImpersonation as apiStartImpersonate } from "../api/security";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

const mapBackendRole = (roles) => {
  if (!roles || roles.length === 0) return null;
  const primaryRole = roles[0];
  if (primaryRole === "SUPER_ADMIN") return "super";
  if (primaryRole === "REGIONAL_ADMIN") return "regional";
  if (primaryRole === "SCHOOL_ADMIN") return "school";
  return primaryRole.toLowerCase();
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [impersonator, setImpersonator] = useState(null);

  // Initialize/Restore Session on load
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");
      const isAuth = localStorage.getItem("authenticated") === "true";
      const savedImpersonator = localStorage.getItem("impersonator");

      if (token && isAuth) {
        try {
          const profileRes = await getProfile();
          if (profileRes.success) {
            const profileData = profileRes.data;
            const mappedRole = mapBackendRole(profileData.roles);
            
            setUser(profileData);
            setRole(mappedRole);
            setIsAuthenticated(true);
            
            if (savedImpersonator) {
              setImpersonator(JSON.parse(savedImpersonator));
            }
          } else {
            throw new Error("Profile fetch unsuccessful");
          }
        } catch (error) {
          console.error("Session restoration failed:", error);
          clearSession();
        }
      } else {
        clearSession();
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  // Socket connection manager
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (isAuthenticated && token) {
      const newSocket = io(API_BASE_URL, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected to server successfully.");
      });

      newSocket.on("notification", (notification) => {
        // Trigger live toast notice
        toast.info(notification.title || "New Notification", {
          description: notification.message || notification.body,
          duration: 6000,
        });
        
        // Dispatch local event to refresh notifications in UI if active
        window.dispatchEvent(new CustomEvent("new_notification", { detail: notification }));
      });

      newSocket.on("connect_error", (err) => {
        console.warn("Socket connection error:", err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.setItem("authenticated", "false");
    localStorage.removeItem("role");
    localStorage.removeItem("impersonator");
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    setImpersonator(null);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.success && res.data) {
        const { accessToken, refreshToken, user: userData } = res.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("authenticated", "true");
        
        const mappedRole = mapBackendRole(userData.roles);
        localStorage.setItem("role", mappedRole);

        // Fetch full profile to get scope details
        const profileRes = await getProfile();
        const profileData = profileRes.success ? profileRes.data : userData;

        setUser(profileData);
        setRole(mappedRole);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, role: mappedRole };
      }
      throw new Error(res.message || "Login failed");
    } catch (err) {
      setLoading(false);
      clearSession();
      throw err;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch (err) {
      console.warn("Logout error on server side:", err);
    } finally {
      clearSession();
    }
  };

  const startImpersonation = async (userId) => {
    try {
      const res = await apiStartImpersonate(userId);
      if (res.success && res.data) {
        const { accessToken, refreshToken, user: targetUser, impersonator: adminInfo } = res.data;
        
        // Save current super admin tokens in backup before overriding
        const superAccess = localStorage.getItem("accessToken");
        const superRefresh = localStorage.getItem("refreshToken");
        const superUser = JSON.stringify(user);
        
        localStorage.setItem("super_accessToken", superAccess);
        localStorage.setItem("super_refreshToken", superRefresh);
        localStorage.setItem("super_user", superUser);

        // Save new impersonated tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("impersonator", JSON.stringify(adminInfo));

        const mappedRole = mapBackendRole(targetUser.roles);
        localStorage.setItem("role", mappedRole);

        // Fetch full profile of impersonated user
        const profileRes = await getProfile();
        const profileData = profileRes.success ? profileRes.data : targetUser;

        setUser(profileData);
        setRole(mappedRole);
        setImpersonator(adminInfo);
        
        toast.success(`Now impersonating ${profileData.first_name} ${profileData.last_name}`);
        
        return { success: true, role: mappedRole };
      }
      throw new Error(res.message || "Impersonation failed");
    } catch (err) {
      toast.error(err.message || "Failed to start impersonation");
      throw err;
    }
  };

  const stopImpersonation = () => {
    const superAccess = localStorage.getItem("super_accessToken");
    const superRefresh = localStorage.getItem("super_refreshToken");
    const superUserRaw = localStorage.getItem("super_user");

    if (superAccess && superRefresh && superUserRaw) {
      localStorage.setItem("accessToken", superAccess);
      localStorage.setItem("refreshToken", superRefresh);
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("role", "super");
      
      localStorage.removeItem("super_accessToken");
      localStorage.removeItem("super_refreshToken");
      localStorage.removeItem("super_user");
      localStorage.removeItem("impersonator");

      const superUser = JSON.parse(superUserRaw);
      setUser(superUser);
      setRole("super");
      setImpersonator(null);
      
      toast.success("Returned to Super Admin session");
      
      // Refresh page to clean up context state cleanly
      setTimeout(() => {
        window.location.href = "/super-admin";
      }, 500);
    } else {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        loading,
        socket,
        impersonator,
        login,
        logout,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
