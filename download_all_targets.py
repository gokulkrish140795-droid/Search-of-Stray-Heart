import urllib.request, http.cookiejar, re, os

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def list_folder(fid):
    url = f'https://drive.google.com/drive/folders/{fid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    return re.findall(r'\[null,\"([a-zA-Z0-9_-]{25,40})\"\],null,null,null,\"([^\"]+)\".*?\[\[\[\"([^\"]+)\"', html)

def download_file(fid, out_path):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 3000:
        return
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    url = f'https://drive.google.com/uc?export=download&id={fid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = opener.open(req)
        content = resp.read()
        if b'uc-download-link' in content or b'confirm=t' in content:
            html = content.decode('utf-8', errors='ignore')
            m_uuid = re.search(r'name=\"uuid\" value=\"([^\"]+)\"', html)
            uuid_val = m_uuid.group(1) if m_uuid else ''
            dl_url = f'https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t&uuid={uuid_val}'
            req2 = urllib.request.Request(dl_url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': url})
            content = opener.open(req2).read()
        with open(out_path, 'wb') as f:
            f.write(content)
        print(f'Saved {out_path} ({len(content)} bytes)')
    except Exception as e:
        print(f'Error downloading {out_path}: {e}')

# 1. Targets folder: 1iAebX4-MZCRPbn-UDTmw-qIoQSbZmxWj
items = list_folder('1iAebX4-MZCRPbn-UDTmw-qIoQSbZmxWj')
print(f'Found {len(items)} target items')
for fid, mime, name in items:
    download_file(fid, f'public/ar/eighthwall/image-targets/{name}')

print('All targets synced!')
