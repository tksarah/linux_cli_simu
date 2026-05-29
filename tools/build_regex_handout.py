from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas


OUT = Path("generated/regex_A4_handout_polished.pdf")

PAGE_W, PAGE_H = A4
MARGIN_X = 13 * mm
MARGIN_TOP = 12 * mm
MARGIN_BOTTOM = 10 * mm
CONTENT_W = PAGE_W - (MARGIN_X * 2)

FONT_JP = "HeiseiKakuGo-W5"
FONT_JP_LIGHT = "HeiseiMin-W3"
FONT_CODE = "Courier"
BLACK = colors.black
DARK = colors.HexColor("#222222")
MID = colors.HexColor("#666666")
LIGHT = colors.HexColor("#F1F1F1")
LINE = colors.HexColor("#BDBDBD")


pdfmetrics.registerFont(UnicodeCIDFont(FONT_JP))
pdfmetrics.registerFont(UnicodeCIDFont(FONT_JP_LIGHT))


def draw_text(c, text, x, y, size=9, font=FONT_JP, color=BLACK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, text)


def draw_right(c, text, x, y, size=8, font=FONT_JP, color=MID):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawRightString(x, y, text)


def rounded_rect(c, x, y, w, h, fill=colors.white, stroke=LINE, radius=4):
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def code_label(c, text, x, y, w=None, h=14, size=8.6):
    width = w or max(18 * mm, pdfmetrics.stringWidth(text, FONT_CODE, size) + 5 * mm)
    rounded_rect(c, x, y, width, h, fill=colors.white, stroke=LINE, radius=2)
    c.setFont(FONT_CODE, size)
    c.setFillColor(BLACK)
    c.drawCentredString(x + width / 2, y + 3.5, text)
    return width


def section_title(c, title, x, y, w):
    c.setFillColor(DARK)
    c.setFont(FONT_JP, 10.2)
    c.drawString(x, y, title)
    c.setStrokeColor(DARK)
    c.setLineWidth(0.8)
    c.line(x, y - 3, x + w, y - 3)


def fit_japanese_lines(text, font, size, width, max_lines=2):
    lines = []
    current = ""
    for ch in text:
        candidate = current + ch
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = ch
            if len(lines) >= max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and len("".join(lines)) < len(text):
        lines[-1] = lines[-1].rstrip("、。") + "…"
    return lines


def draw_basic_table(c, x, y, w, rows, title):
    section_title(c, title, x, y, w)
    y -= 16
    token_w = 31 * mm
    meaning_w = 52 * mm
    example_w = w - token_w - meaning_w
    header_h = 15
    row_h = 28
    c.setLineWidth(0.45)
    c.setStrokeColor(LINE)
    c.setFillColor(LIGHT)
    c.rect(x, y - header_h, w, header_h, stroke=1, fill=1)
    headers = [("記号", x + 5), ("意味", x + token_w + 5), ("例・読み方", x + token_w + meaning_w + 5)]
    for text, hx in headers:
        draw_text(c, text, hx, y - 10, size=7.8, color=DARK)
    y -= header_h
    for token, meaning, example in rows:
        c.setFillColor(colors.white)
        c.rect(x, y - row_h, w, row_h, stroke=1, fill=1)
        c.setStrokeColor(LINE)
        c.line(x + token_w, y, x + token_w, y - row_h)
        c.line(x + token_w + meaning_w, y, x + token_w + meaning_w, y - row_h)
        code_label(c, token, x + 4, y - 21, w=token_w - 8, h=14, size=8.2)
        for i, line in enumerate(fit_japanese_lines(meaning, FONT_JP, 7.0, meaning_w - 8, max_lines=2)):
            draw_text(c, line, x + token_w + 4, y - 10 - (i * 9), size=7.0, color=BLACK)
        draw_text(c, example, x + token_w + meaning_w + 4, y - 13, size=7.0, font=FONT_JP_LIGHT, color=DARK)
        y -= row_h
    return y


def draw_shortcut_table(c, x, y, w, rows, title):
    section_title(c, title, x, y, w)
    y -= 16
    col_w = w / 2
    row_h = 26
    for idx, (token, meaning, note) in enumerate(rows):
        col = idx % 2
        row = idx // 2
        rx = x + (col * col_w)
        ry = y - (row * row_h)
        c.setStrokeColor(LINE)
        c.setFillColor(colors.white)
        c.rect(rx, ry - row_h, col_w, row_h, stroke=1, fill=1)
        code_label(c, token, rx + 4, ry - 20, w=14 * mm, h=13, size=8)
        draw_text(c, meaning, rx + 18 * mm, ry - 10, size=7.0, color=BLACK)
        draw_text(c, note, rx + 18 * mm, ry - 20, size=6.5, font=FONT_JP_LIGHT, color=MID)
    return y - (((len(rows) + 1) // 2) * row_h)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("正規表現 grep 演習 A4 ハンドアウト")
    c.setAuthor("TKLab")

    y = PAGE_H - MARGIN_TOP
    draw_text(c, "Linux 学習ノート", MARGIN_X, y, size=9.5, color=MID)
    draw_right(c, "A4 / モノクロ印刷用", PAGE_W - MARGIN_X, y, size=8)
    y -= 18
    draw_text(c, "正規表現 Regular Expression", MARGIN_X, y, size=19, color=BLACK)
    y -= 16
    draw_text(c, "grep は「検索パターンに合う行」を表示するコマンド。まずは例を読めるようになることを目標にします。", MARGIN_X, y, size=8.4, font=FONT_JP_LIGHT)

    y -= 31
    example_h = 74
    rounded_rect(c, MARGIN_X, y - example_h, CONTENT_W, example_h, fill=LIGHT, stroke=LINE, radius=5)
    draw_text(c, "grep の例を読む", MARGIN_X + 9, y - 15, size=10.3, color=DARK)
    c.setFont(FONT_CODE, 14.5)
    c.setFillColor(BLACK)
    c.drawString(MARGIN_X + 13, y - 39, "$ grep ^0x.*nft$ files.txt")
    parts = [
        ("^", "行の先頭"),
        ("0x", "文字 0x"),
        (".*", "任意の文字が続く"),
        ("nft", "文字 nft"),
        ("$", "行の末尾"),
    ]
    px = MARGIN_X + 13
    py = y - 64
    for token, meaning in parts:
        tw = code_label(c, token, px, py, w=15 * mm, h=13, size=8)
        draw_text(c, meaning, px + tw + 3, py + 3, size=6.7, color=DARK)
        px += 38 * mm
    y -= example_h + 20

    basic_rows = [
        ("^", "行の先頭に一致", "^abc → abcで始まる"),
        ("$", "行の末尾に一致", "xyz$ → xyzで終わる"),
        (".", "任意の1文字に一致", "a.c → abc / axc"),
        ("*", "直前の文字が0回以上", "ab* → a / ab / abb"),
        ("+", "直前の文字が1回以上", "ab+ → ab / abb"),
        ("?", "直前の文字が0回または1回", "colou?r"),
        ("[ ]", "中の文字のいずれか", "[abc] → a,b,c"),
        ("[^ ]", "中の文字以外", "[^ab] → a,b 以外"),
        ("[a-z]", "範囲指定", "[a-cA-C] → a,b,c,A,B,C"),
        ("\\", "記号を文字として扱う", "\\. → . そのもの"),
    ]
    y = draw_basic_table(c, MARGIN_X, y, CONTENT_W, basic_rows, "まず覚える基本メタキャラクタ")

    y -= 18
    shortcut_rows = [
        ("\\d", "数字", "[0-9] と同じ"),
        ("\\D", "数字以外", "not digit"),
        ("\\w", "英数字と _", "[a-zA-Z0-9_]"),
        ("\\W", "英数字と _ 以外", "not word"),
        ("\\s", "空白", "スペース、タブなど"),
        ("\\S", "空白以外", "not space"),
        ("\\b", "単語の境界", "word boundary"),
        ("\\B", "単語の境界でない部分", "not boundary"),
    ]
    y = draw_shortcut_table(c, MARGIN_X, y, CONTENT_W, shortcut_rows, "慣れたら使う便利な略記")

    y -= 17
    tip_h = 45
    rounded_rect(c, MARGIN_X, y - tip_h, CONTENT_W, tip_h, fill=colors.white, stroke=LINE, radius=4)
    draw_text(c, "学習のコツ", MARGIN_X + 8, y - 14, size=9.2, color=DARK)
    draw_text(c, "最初はすべて暗記しなくてOK。^、$、.、*、[ ] を使って grep の例を読めることを目標にします。", MARGIN_X + 8, y - 28, size=7.8, font=FONT_JP_LIGHT)
    draw_text(c, "授業では「どの行が表示されるか」を予想してから実行し、結果を確認しましょう。", MARGIN_X + 8, y - 39, size=7.8, font=FONT_JP_LIGHT)

    draw_text(c, "出典：アップロードされた PowerPoint「regex.pptx」をもとに再構成 / © 2025 Linux Fundamentals", MARGIN_X, MARGIN_BOTTOM - 1, size=6.0, font=FONT_JP_LIGHT, color=MID)
    c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
