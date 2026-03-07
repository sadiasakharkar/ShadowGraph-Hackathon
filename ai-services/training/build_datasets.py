import csv
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

random.seed(42)

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ROOT / "datasets"
IMAGES = DATASETS / "images"


def ensure_dirs() -> None:
    DATASETS.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)


def username_variations(base: str) -> list[str]:
    out = {
        base,
        base + "_official",
        base + ".real",
        base + "1",
        base.replace("a", "4"),
        base.replace("e", "3"),
    }
    if len(base) > 4:
        out.add(base[:-1] + base[-1] * 2)
        out.add(base + "_" + base[:3])
    return list(out)


def build_username_dataset() -> None:
    base_usernames = [
        "sadia_sakharkar",
        "linus_torvalds",
        "security_ninja",
        "aisha_devops",
        "graph_guardian",
        "cyber_analyst",
        "identitywatch",
    ]

    rows = []
    for base in base_usernames:
        vars_same = username_variations(base)
        for i in range(len(vars_same)):
            for j in range(i + 1, len(vars_same)):
                rows.append([vars_same[i], vars_same[j], 1])

    for _ in range(len(rows)):
        a = random.choice(base_usernames)
        b = random.choice([x for x in base_usernames if x != a])
        rows.append([random.choice(username_variations(a)), random.choice(username_variations(b)), 0])

    random.shuffle(rows)
    with (DATASETS / "username_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["left", "right", "label"])
        writer.writerows(rows)


def text_samples() -> dict[str, list[str]]:
    return {
        "author_a": [
            "I map identity risks using careful graph analysis. Signals should be validated before trust.",
            "Threat modeling begins with context. Build evidence chains, then score each anomaly with explainability.",
            "Our security workflow focuses on repeatable controls, deterministic scans, and transparent alerts.",
        ],
        "author_b": [
            "yo i pushed another build today! super fast deploy, very chill, less blockers now.",
            "new sprint, new bugs, but we fix and ship. quick wins matter, keep the flow moving.",
            "team sync was good today; we kept it short, solved auth bug, and moved to next task.",
        ],
        "author_c": [
            "Identity integrity is a socio-technical challenge; attribution requires robust statistical framing.",
            "Stylometric drift across channels can indicate imitation, especially when punctuation entropy shifts.",
            "A resilient platform quantifies uncertainty and updates priors as new public artifacts emerge.",
        ],
    }


def build_text_dataset() -> None:
    authors = text_samples()
    rows = []

    for author, texts in authors.items():
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                rows.append([texts[i], texts[j], 1, author, author])

    author_keys = list(authors.keys())
    for _ in range(len(rows)):
        a, b = random.sample(author_keys, 2)
        rows.append([random.choice(authors[a]), random.choice(authors[b]), 0, a, b])

    random.shuffle(rows)
    with (DATASETS / "text_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["left", "right", "label", "author_left", "author_right"])
        writer.writerows(rows)


def make_avatar(identity: str, variant: int) -> Path:
    size = 128
    bg_seed = abs(hash((identity, variant))) % 255
    bg = (bg_seed, (bg_seed * 2) % 255, (bg_seed * 3) % 255)

    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)

    pad = 10 + variant * 2
    draw.ellipse((pad, pad, size - pad, size - pad), outline=(255, 255, 255), width=3)

    initials = "".join([x[0].upper() for x in identity.split("_")][:2])
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    draw.text((size // 2 - 10, size // 2 - 8), initials, fill=(255, 255, 255), font=font)

    path = IMAGES / f"{identity}_{variant}.png"
    img.save(path)
    return path


def build_image_dataset() -> None:
    identities = ["sadia_sakharkar", "linus_torvalds", "graph_guardian", "cyber_analyst"]
    by_id: dict[str, list[Path]] = {}

    for identity in identities:
        by_id[identity] = [make_avatar(identity, 0), make_avatar(identity, 1), make_avatar(identity, 2)]

    rows = []
    for identity, imgs in by_id.items():
        for i in range(len(imgs)):
            for j in range(i + 1, len(imgs)):
                rows.append([str(imgs[i]), str(imgs[j]), 1, identity, identity])

    for _ in range(len(rows)):
        a, b = random.sample(identities, 2)
        rows.append([str(random.choice(by_id[a])), str(random.choice(by_id[b])), 0, a, b])

    random.shuffle(rows)
    with (DATASETS / "image_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["image_a", "image_b", "label", "identity_a", "identity_b"])
        writer.writerows(rows)


if __name__ == "__main__":
    ensure_dirs()
    build_username_dataset()
    build_text_dataset()
    build_image_dataset()
    print("Datasets generated under", DATASETS)
