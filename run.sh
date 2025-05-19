# HEIC → JPEG に変換して “同じファイル名・拡張子だけ .jpg” で保存
# 対象: suzuki/*.jpg が HEIC、takase/*.JPG に HEIC が混ざっている、
#       kato/02.HEIC  kato/03.HEIC
#
# ① suzuki と takase 以下の拡張子 .jpg/.JPG だが HEIC フォーマットを検出
find public/photos/{suzuki,takase} -type f \( -iname '*.jpg' -o -iname '*.JPG' \) -print0 |
while IFS= read -r -d '' f; do
  fmt=$(file -b "$f")
  if [[ $fmt == ISO\ Media*HEIF* ]]; then
    echo "[CONVERT] $f  (HEIC disguised as JPG)"
    magick "$f" -auto-orient -strip -quality 92 -colorspace sRGB "${f%.*}.jpg"
  fi
done

# ② kato の明示的な HEIC
for f in public/photos/kato/{02,03}.HEIC; do
  [[ -f "$f" ]] || continue
  echo "[CONVERT] $f → ${f%.*}.jpg"
  magick "$f" -auto-orient -strip -quality 92 -colorspace sRGB "${f%.*}.jpg"
done
