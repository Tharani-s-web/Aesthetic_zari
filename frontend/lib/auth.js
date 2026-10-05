// ==========================================
// SAVE AUTHENTICATION DATA
// ==========================================

export const saveAuth = (token, user) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};


// ==========================================
// GET JWT TOKEN
// ==========================================

export const getToken = () => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
};


// ==========================================
// GET LOGGED-IN USER
// ==========================================

export const getUser = () => {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};


// ==========================================
// CHECK LOGIN STATUS
// ==========================================

export const isLoggedIn = () => {
  return !!getToken();
};


// ==========================================
// REMOVE TOKEN
// ==========================================

export const removeToken = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
};


// ==========================================
// LOGOUT USER
// ==========================================

export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};