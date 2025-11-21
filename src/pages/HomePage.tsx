import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { to: "/tracker", title: "트래커", description: "기사 진행 상황을 한눈에 보고 바로 수정합니다." },
  { to: "/feed", title: "피드", description: "콘텐츠 피드를 검토하거나 새 아이디어를 수집합니다." },
  { to: "/upload", title: "보관함", description: "완료된 자료를 정리하고 이미지 업로드 상태를 확인합니다." },
  { to: "/database", title: "데이터베이스", description: "기사 전체 데이터를 그룹별로 탐색합니다." },
  { to: "/write", title: "작성하기", description: "새로운 기사를 초안부터 업로드까지 빠르게 작성합니다." },
];

export default function HomePage() {
  return (
    <div className="w-full px-6 py-10 space-y-10">
      <section className="max-w-4xl mx-auto bg-linear-to-r from-indigo-500 via-blue-500 to-sky-500 text-white rounded-3xl p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.35em] mb-3 opacity-80">ACMEDIA WORKFLOW</p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">오늘도 효율적으로 협업해 볼까요?</h1>
        <p className="text-lg opacity-90 mb-6">
          주요 업무 페이지로 바로 이동하거나, 아래 빠른 링크에서 원하는 기능을 선택하세요.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/tracker"
            className="px-5 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow hover:translate-y-0.5 transition"
          >
            트래커 바로가기
          </Link>
          <Link
            to="/database"
            className="px-5 py-3 border border-white/60 rounded-full font-semibold hover:bg-white/10 transition"
          >
            전체 데이터 보기
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">빠른 시작</h2>
          <p className="text-sm text-gray-500">가장 자주 사용하는 페이지를 카드에서 바로 선택하세요.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2"
            >
              <span className="text-sm font-semibold text-indigo-500">{link.to}</span>
              <h3 className="text-xl font-bold text-gray-900">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
