from pathlib import Path
path = Path('src/components/tracker/TrackerRow.tsx')
lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
lines[18] = 'const EDITOR_OPTIONS = ["지민", "아라", "지안"];'
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
start = next(i for i,l in enumerate(lines) if l.strip().startswith('const STATUS_OPTIONS'))
end = start
while end < len(lines) and '];' not in lines[end]:
    end += 1
lines = lines[:start] + status_block + lines[end+1:]
path.write_text('\n'.join(lines), encoding='utf-8')
print('row fixed')
