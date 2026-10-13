"""Bangun index.html (untuk Vercel) dari sumber prototipe + koneksi Supabase."""
import sys
src = sys.argv[1] if len(sys.argv) > 1 else "../tokoku-lite.html"
s = open(src, encoding="utf-8").read()
head = ('<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n')
i = s.index("<style>"); j = s.index("</style>") + len("</style>")
sb = ('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>\n'
      '<script>window.TKL_SB={url:"https://kubvpobndqhixtucwcdg.supabase.co",key:"sb_publishable_PWUOC-rAbTLX2w-9erjNvQ_bxhoCgQ4"};</script>\n')
body = s[j:]
k = body.index("<script>")
body = body[:k] + sb + body[k:]
open("index.html", "w", encoding="utf-8").write(
    head + s[:i] + s[i:j] + '\n<style>html,body{margin:0;height:100%}</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
print("index.html ditulis")
