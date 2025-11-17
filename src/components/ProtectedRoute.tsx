import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verifyProfile = async () => {
      if (!session) {
        setAuthorized(false);
        setProfileChecked(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setAuthorized(false);
        await supabase.auth.signOut();
      } else {
        setAuthorized(true);
      }

      setProfileChecked(true);
    };

    verifyProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading || !profileChecked) return <p>Loading...</p>;

  if (!session || !authorized) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
