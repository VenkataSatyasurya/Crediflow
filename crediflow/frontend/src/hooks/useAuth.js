import { useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const loginUser = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loginUser, logoutUser };
};
