from pathlib import Path
path = Path('src/components/tracker/TrackerTable.tsx')
lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
lines[39] = 'const DEFAULT_EDITOR_OPTIONS = ["지민", "아라", "지안"];'
status_block = [
    'const DEFAULT_STATUS_OPTIONS = [',
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
lines[41:41+len(status_block)] = status_block
path.write_text('\n'.join(lines), encoding='utf-8')
print('table fixed')
