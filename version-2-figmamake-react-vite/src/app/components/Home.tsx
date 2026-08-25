import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import buildingImg from "@/imports/buildingg.jpg";
import { signInAdmin } from "../lib/auth";
import type { AppUser } from "../lib/types";

interface HomeProps {
  onViewCourses: () => void;
  onSignedIn: (admin: AppUser) => void;
}

export function Home({ onViewCourses, onSignedIn }: HomeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      onSignedIn(await signInAdmin());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        className="hidden md:block"
        style={{ flex: 1, position: "relative", backgroundColor: "#f4f5f7", overflow: "hidden" }}
      >
        <ImageWithFallback
          src={buildingImg}
          alt="Aramco Corporate Academy building"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }}
        />
      </div>

      <div
        className="w-full md:w-1/2"
        style={{ backgroundColor: "#0033A0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2.5rem", minHeight: "100vh" }}
      >
        <div style={{ width: "100%", maxWidth: "300px" }}>
          <h1 style={{ fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: 0 }}>
            Corporate Academy
          </h1>
          <p style={{ fontFamily: "'Segoe UI',sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", marginTop: "0.375rem", marginBottom: 0 }}>
            Course Schedule
          </p>

          {error && (
            <p style={{ marginTop: "1.5rem", borderRadius: "0.5rem", backgroundColor: "rgba(255,255,255,0.1)", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button
              onClick={onViewCourses}
              style={{ width: "100%", borderRadius: "9999px", backgroundColor: "#84BD00", border: "none", padding: "0.875rem 1.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#fff", letterSpacing: "0.04em", cursor: "pointer", fontFamily: "'Segoe UI',sans-serif" }}
            >
              View Courses
            </button>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: "100%", borderRadius: "9999px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.4)", padding: "0.875rem 1.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#fff", letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, fontFamily: "'Segoe UI',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? (
                <><Loader2 style={{ width: "1rem", height: "1rem" }} className="animate-spin" /> Signing in…</>
              ) : "Administrator Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
