import TrackerRow from "./TrackerRow";

interface Article {
  id: number;
  title: string;
  summary: string;
  body: string;
  source: string;
  status: string;
  editor?: string;
  content_source?: string;
  images: string[] | null;
  created_at?: string;
  latest_comment?: string;
}

interface TrackerTableProps {
  articles: Article[];
  onDoubleClick: (item: Article) => void;
  onInlineUpdate: (id: number, field: string, value: string) => void;
  onImageClick: (e: React.MouseEvent, item: Article) => void;
  onMemoClick: (item: Article) => void;
}

export default function TrackerTable({
  articles,
  onDoubleClick,
  onInlineUpdate,
  onImageClick,
  onMemoClick,
}: TrackerTableProps) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b bg-gray-100">
          <th className="py-2 px-1 w-10 text-sm">번호</th>
          <th className="py-2 px-1 w-20 text-sm">사진</th>
          <th className="py-2 px-1 w-24 text-sm">날짜</th>
          <th className="py-2 px-1 w-24 text-sm">에디터</th>

          {/* ⭐ 제목 칼럼 폭 제한 추가 */}
          <th className="py-2 px-1 w-[140px] text-sm">제목</th>

          <th className="py-2 px-1 w-20 text-sm">상태</th>
          <th className="py-2 px-1 w-40 text-sm">메모</th>
        </tr>
      </thead>

      <tbody>
        {articles.map((item, index) => (
          <TrackerRow
            key={item.id}
            index={index}
            item={item}
            onDoubleClick={onDoubleClick}
            onInlineUpdate={onInlineUpdate}
            onImageClick={onImageClick}
            onMemoClick={onMemoClick}
          />
        ))}
      </tbody>
    </table>
  );
}
