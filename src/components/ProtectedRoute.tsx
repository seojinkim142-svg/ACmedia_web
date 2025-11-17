import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // 로그인 없이 접근 가능한 공개 라우트
  const publicRoutes = ["/signin", "/auth/callback", "/password-recovery"];

  // 세션/로딩/권한 상태
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // 1) 세션 상태 감시 (Supabase 공식 패턴)
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

  // 2) 권한(프로필) 확인
  useEffect(() => {
    let cancelled = false;

    const checkProfile = async () => {
      // 세션 로딩 중이면 검사를 하지 않음
      if (sessionLoading) return;

      // 공개 라우트는 권한 체크 필요 없음
      if (publicRoutes.includes(location.pathname)) {
        setAuthorized(true);
        setProfileChecked(true);
        return;
      }

      // 로그인 상태가 아니면 접근 불가
      if (!session) {
        setAuthorized(false);
        setProfileChecked(true);
        return;
      }

      // 로그인 후: 프로필 존재 여부 확인
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        // 프로필 없으면 로그아웃 + 접근 불가
        await supabase.auth.signOut();
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }

      setProfileChecked(true);
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [session, sessionLoading, location.pathname]);

  // 3) 로딩 표시
  if (sessionLoading || !profileChecked) {
    return <p>Loading...</p>;
  }

  // 4) 공개 라우트는 그대로 렌더링
  if (publicRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // 5) 보호 라우트 접근권한 체크
  if (!session || !authorized) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
