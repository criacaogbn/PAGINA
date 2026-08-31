# -*- coding: utf-8 -*-
"""Converte as páginas do PDF 'From_Pixel_to_Metal' em JPGs para o slideshow da galeria."""
import os
import re
import shutil
import sys

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf

PDF_SRC = r"c:\Users\glauber\Downloads\From_Pixel_to_Metal (1).pdf"
OUT_DIR = r"e:\gbn3d\site2\imagens_industria"
PDF_DST = os.path.join(OUT_DIR, "From_Pixel_to_Metal.pdf")
TARGET_W = 1400  # largura alvo das imagens (px)
JPEG_QUAL = 82


def clean(s):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = pymupdf.open(PDF_SRC)
    n = doc.page_count
    print(f"PAGINAS: {n}")
    lines = []
    for i, page in enumerate(doc, start=1):
        r = page.rect
        zoom = TARGET_W / float(r.width)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        name = f"slide_{i:02d}.jpg"
        path = os.path.join(OUT_DIR, name)
        pix.save(path, jpg_quality=JPEG_QUAL)
        text = clean(page.get_text("text"))
        # primeira linha significativa como "título" da página
        first = ""
        for ln in page.get_text("text").splitlines():
            ln = clean(ln)
            if ln and not ln.isdigit():
                first = ln
                break
        lines.append(f"{name} | {r.width:.0f}x{r.height:.0f} | {pix.width}x{pix.height} | titulo: {first[:90]}")
        print(lines[-1].encode("utf-8", "replace").decode("utf-8"))
    doc.close()
    shutil.copyfile(PDF_SRC, PDF_DST)
    print(f"PDF copiado para: {PDF_DST} ({os.path.getsize(PDF_DST)} bytes)")
    print("CONCLUIDO")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
