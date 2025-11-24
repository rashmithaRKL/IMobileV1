import { create } from "zustand"

interface AdminUser {
  id: string
  email: string
  name: string
}

interface AdminState {
  user: AdminUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Simple authentication - in production, use proper backend auth
    if (email === "imobile.admin@gmail.com" && password === "123456") {
      set({
        user: {
          id: "1",
          email: email,
          name: "Admin",
        },
        isAuthenticated: true,
      })
    } else {
      throw new Error("Invalid credentials")
    }
  },
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))
