import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { PublicDisplay } from "./components/PublicDisplay";
import { Dashboard } from "./components/Dashboard";
import { AdminsPage } from "./components/AdminsPage";
import { subscribeAdmin, signOutAdmin } from "./lib/auth";
import type { AppUser } from "./lib/types";

type View = "home" | "display" | "dashboard" | "admins";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [admin, setAdmin] = useState<AppUser | null>(null);

  useEffect(() => {
    return subscribeAdmin((a) => {
      if (a) setAdmin(a);
    });
  }, []);

  async function handleSignOut() {
    await signOutAdmin();
    setAdmin(null);
    setView("home");
  }

  const needsAdmin = view === "dashboard" || view === "admins";
  const activeView: View = needsAdmin && !admin ? "home" : view;
  const showHeader = activeView === "dashboard" || activeView === "admins";

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {showHeader && <Header onSignOut={handleSignOut} />}
      <main>
        {activeView === "home" && (
          <Home
            onViewCourses={() => setView("display")}
            onSignedIn={(a) => {
              setAdmin(a);
              setView("dashboard");
            }}
          />
        )}
        {activeView === "display" && (
          <PublicDisplay onBack={() => setView("home")} />
        )}
        {activeView === "dashboard" && admin && (
          <Dashboard
            admin={admin}
            onManageAdmins={() => setView("admins")}
          />
        )}
        {activeView === "admins" && admin && (
          <AdminsPage onManageCourses={() => setView("dashboard")} />
        )}
      </main>
    </div>
  );
}
