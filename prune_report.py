import re

with open('BAO_CAO_DO_AN_VISIONINSPECT_v5_SHORT.md', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('Docker Compose — 4 services', 'Docker Compose — 2 services chính')
text = text.replace('- `redis` — Message broker\n', '')
text = text.replace('- `training-worker` — RQ worker cho AI training\n', '')

with open('BAO_CAO_DO_AN_VISIONINSPECT_v5_SHORT.md', 'w', encoding='utf-8') as f:
    f.write(text)
