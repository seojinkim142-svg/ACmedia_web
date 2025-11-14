import { useState } from "react";
import DetailModal from "C:/Users/tjwls/my-project/src/components/DetailModal";

interface Item {
  id: number;
  title: string;
  summary: string;
  body: string;
  image: string;
  source: string;
  status: string;
}

const sampleData: Item[] = [
  {
    id: 1,
    title: "“이 베이글 미쳤다!” 소리 절로 나오는 베이글 찐 맛집",
    summary: "압도적인 맛과 고소함으로 SNS에서 화제가 된 베이글...",
    body: "여기에 본문이 들어갑니다.\n줄바꿈도 가능하고 긴 텍스트도 넣을 수 있습니다.",
    image: "https://picsum.photos/120/120?random=1",
    source: "기사",
    status: "리뷰",
  },
  {
    id: 2,
    title: "큰딸 기다리시는 친정어머니",
    summary: "따뜻한 감동 이야기...",
    body: "본문 들어가는 곳",
    image: "https://picsum.photos/120/120?random=2",
    source: "인스타",
    status: "업로드대기",
  },
  {
    id: 3,
    title: "음냐 외식 - 나중엔 없다",
    summary: "한 번뿐인 순간을 놓치지 말라는 메시지...",
    body: "본문 내용이 여기에...",
    image: "https://picsum.photos/120/120?random=3",
    source: "AI",
    status: "추천",
  },
];

const TrackerPage = () => {
  const [openItem, setOpenItem] = useState<Item | null>(null);

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-4">트래커 페이지</h1>

      <div className="flex flex-col">
        {sampleData.map((item) => (
          <div
            key={item.id}
            onClick={() => setOpenItem(item)}
            className="flex items-center gap-4 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* 번호 */}
            <div className="text-3xl font-semibold text-gray-400 w-10 shrink-0 text-center">
              {item.id}
            </div>

            {/* 이미지 */}
            <img
              src={item.image}
              alt=""
              className="w-20 h-20 rounded-md object-cover shrink-0"
            />

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 line-clamp-1">
                {item.title}
              </div>
              <div className="text-gray-500 text-sm line-clamp-1">
                {item.summary}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      <DetailModal
        isOpen={openItem !== null}
        onClose={() => setOpenItem(null)}
        item={openItem}
      />
    </div>
  );
};

export default TrackerPage;
