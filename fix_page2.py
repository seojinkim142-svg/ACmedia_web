from pathlib import Path
path = Path('src/pages/TrackerPage.tsx')
lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
lines[24] = 'const STATUS_BOARD = ["리뷰", "추천", "본문 작성", "본문 완료"];'
lines[25] = 'const IMAGE_STATUS_BOARD = ["이미지 생성", "이미지 완료", "업로드 예정"];'
start = 26
end = start
while end < len(lines) and '];' not in lines[end]:
    end += 1
status_block = [
    'const STATUS_OPTIONS = [',
    '  "리뷰",',
    '  "추천",',
    '  "보류",',
    '  "본문 작성",',
    '  "본문 완료",',
    '  "이미지 생성",',
    '  "이미지 완료",',
    '  "업로드 예정",',
    '  "중복",',
    '];'
]
lines = lines[:start] + status_block + lines[end+1:]
path.write_text('\n'.join(lines), encoding='utf-8')
print('page fixed')
