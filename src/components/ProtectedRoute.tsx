import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // 로그인 없이 접근 가능한 공개 라우트 목록
  const publicRoutes = [
    "/signin",
    "/auth/callback",
    "/password-recovery",    // 🔥 중요: 비밀번호 재설정 링크
  ];

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
      // 🔥 공개 페이지는 프로필 검사 필요 없음
      if (publicRoutes.includes(location.pathname)) {
        setAuthorized(true);
        setProfileChecked(true);
        return;
      }

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
  }, [session, location.pathname]);

  if (loading || !profileChecked) return <p>Loading...</p>;

  // 🔥 공개 라우트는 리다이렉트 금지
  if (publicRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // 보호된 라우트는 세션 + 권한 필요
  if (!session || !authorized) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

