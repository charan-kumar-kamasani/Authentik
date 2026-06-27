import json

with open('/Users/charankumarkamasani/.gemini/antigravity-ide/brain/0198a839-9b92-4da3-b6ac-fd089805ac07/.system_generated/logs/transcript_full.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT':
                text = data.get('content', {}).get('text', '').lower()
                if 'check attachment i added all assets' in text:
                    media = data.get('content', {}).get('media', [])
                    for idx, m in enumerate(media):
                        if 'data' in m:
                            import base64
                            mime = m['mime_type'].split('/')[1]
                            filename = f'asset_sheet_{idx}.{mime}'
                            with open(filename, 'wb') as out:
                                out.write(base64.b64decode(m['data']))
                            print(f'Saved {filename}')
        except Exception as e:
            pass
