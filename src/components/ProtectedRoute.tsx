import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute() {
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkProfile = async () => {
      if (sessionLoading) return;

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
        await supabase.auth.signOut();
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }

      setProfileChecked(true);
    };

    setProfileChecked(false);
    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [session, sessionLoading]);

  if (sessionLoading || !profileChecked) {
    return <p>Loading...</p>;
  }

  if (!session || !authorized) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

