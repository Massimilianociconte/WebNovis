#!/usr/bin/env python3
"""
Audit immagini del sito (Blog + pagine località/servizi).

Obiettivi:
- Trovare riferimenti a immagini che puntano a file inesistenti (missing).
- Evidenziare immagini riusate in molte pagine (possibili duplicazioni di "custom").
- Trovare file immagine duplicati per contenuto (hash identico) in cartelle diverse.

Nota:
- Considera solo riferimenti locali (esclude http/https/data:).
- Supporta <img src>, <img data-src>, <source srcset>, e srcset su <img>.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"}


def is_external_url(url: str) -> bool:
    u = url.strip().lower()
    return u.startswith(("http://", "https://", "data:", "mailto:", "tel:"))


def split_srcset(srcset: str) -> list[str]:
    # "a.webp 1x, b.webp 2x" oppure "a.webp 320w, ..."
    parts: list[str] = []
    for chunk in srcset.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        # prima "word" è l'URL
        url = chunk.split()[0].strip()
        if url:
            parts.append(url)
    return parts


def normalize_ref(ref: str) -> str:
    # Rimuovi query/hash
    ref = ref.strip().strip('"').strip("'")
    ref = ref.split("#", 1)[0]
    ref = ref.split("?", 1)[0]
    return ref


@dataclass(frozen=True)
class ImageRef:
    page: Path
    raw_ref: str
    resolved_path: Path | None  # None se esterno o non risolvibile


IMG_SRC_RE = re.compile(r"<img\b[^>]*(?:\bsrc|\bdata-src)=\"([^\"]+)\"[^>]*>", re.IGNORECASE)
IMG_SRCSET_RE = re.compile(r"<img\b[^>]*\bsrcset=\"([^\"]+)\"[^>]*>", re.IGNORECASE)
SOURCE_SRCSET_RE = re.compile(r"<source\b[^>]*\bsrcset=\"([^\"]+)\"[^>]*>", re.IGNORECASE)


def extract_image_refs_from_html(page_path: Path) -> list[ImageRef]:
    html = page_path.read_text(encoding="utf-8", errors="replace")
    refs: list[ImageRef] = []

    def add_ref(raw: str) -> None:
        raw = normalize_ref(raw)
        if not raw or is_external_url(raw):
            refs.append(ImageRef(page=page_path, raw_ref=raw, resolved_path=None))
            return
        # Normalizza path assoluti tipo "/Img/..." -> relativo alla root repo
        if raw.startswith("/"):
            resolved = Path(raw.lstrip("/"))
        else:
            resolved = (page_path.parent / raw).resolve()
            try:
                resolved = resolved.relative_to(Path.cwd())
            except Exception:
                # Se la pagina è fuori dalla cwd per qualche motivo, conserva assoluto
                pass
        refs.append(ImageRef(page=page_path, raw_ref=raw, resolved_path=resolved))

    for m in IMG_SRC_RE.finditer(html):
        add_ref(m.group(1))
    for m in IMG_SRCSET_RE.finditer(html):
        for url in split_srcset(m.group(1)):
            add_ref(url)
    for m in SOURCE_SRCSET_RE.finditer(html):
        for url in split_srcset(m.group(1)):
            add_ref(url)

    return refs


def iter_html_pages(root: Path) -> Iterable[Path]:
    # Include root HTML + cartelle note (blog/, servizi/, portfolio/…)
    for path in root.rglob("*.html"):
        # Evita cartelle di output o roba irrilevante se presenti
        parts = {p.lower() for p in path.parts}
        if "dist" in parts:
            continue
        if "node_modules" in parts:
            continue
        if "reports" in parts:
            continue
        yield path


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def iter_image_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() in IMAGE_EXTENSIONS:
            parts = {p.lower() for p in path.parts}
            if "node_modules" in parts:
                continue
            yield path


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Root del progetto (default: .)")
    parser.add_argument(
        "--reuse-threshold",
        type=int,
        default=6,
        help="Segnala immagini usate in >= N pagine (default: 6)",
    )
    parser.add_argument(
        "--out-dir",
        default="reports/image-audit",
        help="Directory output report (default: reports/image-audit)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    out_dir = (root / args.out_dir).resolve()

    # Imposta cwd per le relative_to(Path.cwd()) usate nella risoluzione
    os.chdir(root)

    pages = list(iter_html_pages(root))
    all_refs: list[ImageRef] = []
    for page in pages:
        all_refs.extend(extract_image_refs_from_html(page))

    # Missing: refs locali con resolved_path non esistente
    missing_rows: list[dict[str, str]] = []
    for ref in all_refs:
        if ref.resolved_path is None:
            continue
        resolved = ref.resolved_path if isinstance(ref.resolved_path, Path) else Path(ref.resolved_path)
        # Se è rimasto assoluto, prova comunque
        exists = (resolved if resolved.is_absolute() else (root / resolved)).exists()
        if not exists:
            missing_rows.append(
                {
                    "page": str(ref.page.relative_to(root)),
                    "ref": ref.raw_ref,
                    "resolved_path": str(resolved),
                }
            )

    # Reuse: quante pagine referenziano lo stesso path immagine
    ref_to_pages: dict[str, set[str]] = {}
    for ref in all_refs:
        if ref.resolved_path is None:
            continue
        resolved = ref.resolved_path
        resolved_str = str(resolved)
        ref_to_pages.setdefault(resolved_str, set()).add(str(ref.page.relative_to(root)))

    reuse_rows: list[dict[str, str]] = []
    for resolved_str, page_set in sorted(ref_to_pages.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        if len(page_set) >= args.reuse_threshold:
            reuse_rows.append(
                {
                    "image_path": resolved_str,
                    "pages_count": str(len(page_set)),
                    "pages_sample": " | ".join(sorted(list(page_set))[:12]),
                }
            )

    # Hash duplicates: file diversi con contenuto identico
    # Limita a Img/ per performance/pertinenza, se presente
    img_root = root / "Img"
    image_files = list(iter_image_files(img_root if img_root.exists() else root))
    hash_to_files: dict[str, list[str]] = {}
    for f in image_files:
        try:
            digest = sha256_file(f)
        except Exception as e:
            raise RuntimeError(f"Impossibile calcolare hash per {f}: {e}") from e
        rel = str(f.relative_to(root))
        hash_to_files.setdefault(digest, []).append(rel)

    hash_dup_rows: list[dict[str, str]] = []
    for digest, files in sorted(hash_to_files.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        if len(files) <= 1:
            continue
        # Vogliamo duplicati "reali": path diversi
        hash_dup_rows.append(
            {
                "sha256": digest,
                "files_count": str(len(files)),
                "files": " | ".join(sorted(files)),
            }
        )

    missing_csv = out_dir / "missing.csv"
    reuse_csv = out_dir / "high-reuse.csv"
    hash_dup_csv = out_dir / "hash-duplicates.csv"

    write_csv(missing_csv, ["page", "ref", "resolved_path"], missing_rows)
    write_csv(reuse_csv, ["image_path", "pages_count", "pages_sample"], reuse_rows)
    write_csv(hash_dup_csv, ["sha256", "files_count", "files"], hash_dup_rows)

    print("Image audit completato.")
    print(f"- Pagine HTML analizzate: {len(pages)}")
    print(f"- Riferimenti immagini trovati: {len(all_refs)}")
    print(f"- Missing refs: {len(missing_rows)} -> {missing_csv.relative_to(root)}")
    print(f"- High reuse (>= {args.reuse_threshold}): {len(reuse_rows)} -> {reuse_csv.relative_to(root)}")
    print(f"- Hash duplicates: {len(hash_dup_rows)} -> {hash_dup_csv.relative_to(root)}")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ERRORE: {e}", file=sys.stderr)
        raise

