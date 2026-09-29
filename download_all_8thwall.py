import urllib.request, http.cookiejar, re, os, time

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def download_file(fid, out_path):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        return
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    url = f'https://drive.google.com/uc?export=download&id={fid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = opener.open(req)
        content = resp.read()
        if b'uc-download-link' in content or b'confirm=t' in content:
            html = content.decode('utf-8', errors='ignore')
            m_action = re.search(r'action=\"([^\"]+)\"', html)
            m_uuid = re.search(r'name=\"uuid\" value=\"([^\"]+)\"', html)
            action_url = m_action.group(1) if m_action else 'https://drive.usercontent.google.com/download'
            uuid_val = m_uuid.group(1) if m_uuid else ''
            confirm_url = f'{action_url}?id={fid}&export=download&confirm=t'
            if uuid_val:
                confirm_url += f'&uuid={uuid_val}'
            req2 = urllib.request.Request(confirm_url, headers={'User-Agent': 'Mozilla/5.0'})
            content = opener.open(req2).read()
        with open(out_path, 'wb') as f:
            f.write(content)
        print(f'Saved {out_path} ({len(content)} bytes)')
    except Exception as e:
        print(f'Error downloading {out_path}: {e}')

def list_folder(fid):
    url = f'https://drive.google.com/drive/folders/{fid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    return re.findall(r'\[null,\"([a-zA-Z0-9_-]{25,40})\"\],null,null,null,\"([^\"]+)\".*?\[\[\[\"([^\"]+)\"', html)

def recurse_download(fid, local_dir):
    items = list_folder(fid)
    for sub_id, mime, name in items:
        target_path = os.path.join(local_dir, name)
        if 'application/vnd.google-apps.folder' in mime:
            recurse_download(sub_id, target_path)
        else:
            download_file(sub_id, target_path)

print('Downloading runtime and xr scripts...')
recurse_download('1e7e8DXbvDrszxB9NcOjDWDyaJEqyAh9i', 'public/ar/eighthwall/external')
print('External scripts downloaded!')
