import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Force IPv4 so Windows does not try to bind the blocked IPv6 ::1 socket.
    host: "127.0.0.1",
    // Windows excludes port 5173 on this machine (range 5141-5240).
    port: 3000,
    // Fail clearly if 5173 is occupied instead of silently switching ports.
    strictPort: true,
  },
});
