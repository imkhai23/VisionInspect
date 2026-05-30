import zipfile
import os

folder = 'supabase_scripts'
output = 'VisionInspect_Supabase_Scripts.zip'

with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file in os.listdir(folder):
        filepath = os.path.join(folder, file)
        zipf.write(filepath, os.path.join('supabase_scripts', file))
        print(f'  Da them: {file}')

print(f'\nHoan thanh! File zip da duoc tao: {output}')
