from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


def _try_register_fonts() -> None:
    """
    Use Calibri when available (Windows), otherwise fall back to built-ins.
    """
    windows_fonts = Path(r"C:\Windows\Fonts")
    calibri = windows_fonts / "calibri.ttf"
    calibri_bold = windows_fonts / "calibrib.ttf"
    if calibri.exists() and calibri_bold.exists():
        pdfmetrics.registerFont(TTFont("Calibri", str(calibri)))
        pdfmetrics.registerFont(TTFont("Calibri-Bold", str(calibri_bold)))


def _wrap_lines(text: str, max_chars: int) -> list[str]:
    words = (text or "").split()
    lines: list[str] = []
    line: list[str] = []
    for w in words:
        candidate = (" ".join(line + [w])).strip()
        if len(candidate) <= max_chars or not line:
            line.append(w)
        else:
            lines.append(" ".join(line))
            line = [w]
    if line:
        lines.append(" ".join(line))
    return lines


def build_one_page_pdf(output_path: Path) -> None:
    _try_register_fonts()

    width, height = A4
    c = canvas.Canvas(str(output_path), pagesize=A4)

    font_regular = "Calibri" if "Calibri" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
    font_bold = "Calibri-Bold" if "Calibri-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"

    margin_x = 14 * mm
    margin_top = 14 * mm
    margin_bottom = 14 * mm

    x = margin_x
    y = height - margin_top
    line_h = 5.0 * mm

    def draw_title(title: str) -> None:
        nonlocal y
        c.setFont(font_bold, 16)
        c.drawString(x, y, title)
        y -= 8.5 * mm

    def draw_meta(meta: str) -> None:
        nonlocal y
        c.setFont(font_regular, 9)
        c.setFillGray(0.25)
        c.drawString(x, y, meta)
        c.setFillGray(0.0)
        y -= 6.5 * mm

    def section(header: str) -> None:
        nonlocal y
        y -= 1.0 * mm
        c.setFont(font_bold, 11)
        c.drawString(x, y, header)
        y -= 5.5 * mm

    def bullet(text: str, max_chars: int = 110) -> None:
        nonlocal y
        c.setFont(font_regular, 9.5)
        lines = _wrap_lines(text, max_chars=max_chars)
        if not lines:
            return
        c.drawString(x, y, "• " + lines[0])
        y -= line_h
        for ln in lines[1:]:
            c.drawString(x + 6.0 * mm, y, ln)
            y -= line_h

    def spacer(mm_space: float) -> None:
        nonlocal y
        y -= mm_space * mm

    draw_title("PHPD — Production Server Specs (One Page)")
    draw_meta(
        f"Generated: {date.today().isoformat()}  |  Profile: mission‑critical, 100–300 concurrent users, mixed access, "
        "uploads 50–200 GB/month, retain forever"
    )

    section("1) Application stack (from repo)")
    bullet("Backend: Django + DRF + JWT (SimpleJWT), GeoDjango + REST framework GIS.")
    bullet("Database: PostgreSQL + PostGIS (GeoDjango postgis engine used in local/production settings).")
    bullet("Frontend: React (Vite). Production deploy is static build + API base URL via Vite env.")
    bullet("Uploads: images, documents, XER files; media must be shared across app servers in production.")

    spacer(1.0)
    section("2) Recommended production architecture (hosting‑neutral)")
    bullet("Edge: TLS termination + reverse proxy/load balancer (HA pair). Only 443 exposed publicly.")
    bullet("App tier: 2+ Django app nodes behind LB (Nginx + Gunicorn/Uvicorn). Scale horizontally.")
    bullet("DB tier: PostgreSQL + PostGIS with HA (primary + standby). DB is private (no public access).")
    bullet("Media storage (best choice): object storage (S3‑compatible/cloud blob) + optional CDN for downloads.")
    bullet("Backups/DR: PITR for DB; object versioning + replication for media; regular restore tests.")

    spacer(1.0)
    section("3) Initial sizing (can scale up/down)")
    bullet("Load balancer / reverse proxy (x2): 2 vCPU, 4 GB RAM, 30–50 GB disk.")
    bullet("App servers (x2 start): 8 vCPU, 16–32 GB RAM, 80–150 GB disk; stateless (no permanent media).")
    bullet("DB servers (x2): 8–16 vCPU, 32–64 GB RAM, NVMe/SSD; start 1–2 TB data + 200–500 GB WAL/logs.")
    bullet("Object storage: capacity plan ~0.6–2.4 TB/year (based on 50–200 GB/month) + replication overhead.")

    spacer(1.0)
    section("4) Security, networking, and ops")
    bullet("Network segmentation: public LB only; app/DB on private subnets; restrict DB to app security group only.")
    bullet("Django hardening: DEBUG=False, strict ALLOWED_HOSTS, secure cookies, rotate secrets via vault/secret manager.")
    bullet("Observability: centralized logs; metrics/alerts for app saturation, DB replication lag, slow queries, disk usage.")
    bullet("SLO focus: remove single points of failure; planned maintenance windows; patching and backup verification.")

    # Footer
    y = max(y, margin_bottom + 8 * mm)
    c.setFont(font_regular, 8.5)
    c.setFillGray(0.35)
    c.drawRightString(
        width - margin_x,
        margin_bottom,
        "Note: Hosting platform not finalized; this spec is vendor‑neutral and HA‑oriented.",
    )
    c.setFillGray(0.0)

    c.showPage()
    c.save()


def main() -> None:
    docs_dir = Path(__file__).resolve().parent
    output = docs_dir / "PHPD_Server_Specs_OnePage.pdf"
    build_one_page_pdf(output)
    print(f"Wrote: {output}")


if __name__ == "__main__":
    main()

