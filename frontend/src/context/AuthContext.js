import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Set a default authenticated state
    const [user, setUser] = useState({ name: "Default User" });

    const login = (token, name) => {
        // Skip token storage and directly set user
        setUser({ name: name || "Default User" })
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
