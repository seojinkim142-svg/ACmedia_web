interface Item {
    id: number;
    title: string;
    description: string;
    image: string;
}

const dummyData: Item[] = [
    {
        id: 1,
        title: "“이 베이글 미쳤다!” 소리 절로 나오는 베이글 찐 맛집",
        description: "맛도 비주얼도 고소함으로 SNS에서 화제가 된 베이글...",
        image: "/assets/sample1.jpg"
    },
    {
        id: 2,
        title: "큰딸 기다리시는 친정어머니",
        description: "딸을 마중하러 나온 어머니의 감동적인 이야기...",
        image: "/assets/sample2.jpg"
    },
    {
        id: 3,
        title: "읍내 외식 - 나중엔 없다",
        description: "오랜만에 읍내에서 즐기는 소박한 외식 이야기...",
        image: "/assets/sample3.jpg"
    }
];

export default function TrackerPage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">트래커 페이지</h1>

            <div className="space-y-6">
                {dummyData.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start border-b pb-4 gap-4"
                    >
                        {/* 번호 */}
                        <div className="text-2xl font-bold text-gray-600 w-8 shrink-0">
                            {item.id}
                        </div>

                        {/* 이미지 */}
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-28 h-20 object-cover rounded-md shrink-0"
                        />

                        {/* 텍스트 */}
                        <div className="flex flex-col">
                            <div className="font-semibold text-lg">{item.title}</div>
                            <div className="text-gray-500 text-sm mt-1">
                                {item.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
