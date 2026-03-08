import csv
import hashlib
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SEED = 42
RNG = random.Random(SEED)

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ROOT / "datasets"
IMAGES = DATASETS / "images"
TARGET_ROWS = 4000


def ensure_dirs() -> None:
    DATASETS.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)


def stable_hash_int(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)


def username_variations(base: str) -> list[str]:
    token = base.replace("_", "")
    out = {
        base,
        f"{base}_official",
        f"{base}.real",
        f"{base}_secure",
        f"{base}1",
        f"{base}007",
        base.replace("a", "4"),
        base.replace("e", "3"),
        base.replace("i", "1"),
        f"{token[:6]}_{token[-3:]}",
    }
    if len(base) > 6:
        out.add(base[:-1] + base[-1] * 2)
        out.add(f"{base}_{len(base)}")
    return sorted(out)


def generate_base_usernames() -> list[str]:
    prefixes = [
        "shadow",
        "cyber",
        "graph",
        "identity",
        "risk",
        "secure",
        "signal",
        "intel",
        "threat",
        "guardian",
        "zero",
        "trust",
        "vector",
        "sentinel",
        "forensic",
    ]
    suffixes = [
        "analyst",
        "hunter",
        "defender",
        "watch",
        "ops",
        "labs",
        "node",
        "pilot",
        "core",
        "engineer",
        "mapper",
        "shield",
        "insight",
        "probe",
        "radar",
    ]

    results: list[str] = []
    for p in prefixes:
        for s in suffixes:
            results.append(f"{p}_{s}")
    return results


def build_username_dataset(target_rows: int = TARGET_ROWS) -> None:
    base_usernames = generate_base_usernames()
    positives: list[list[object]] = []
    negatives: list[list[object]] = []

    while len(positives) < target_rows // 2:
        base = RNG.choice(base_usernames)
        variants = username_variations(base)
        left, right = RNG.sample(variants, 2)
        positives.append([left, right, 1])

    while len(negatives) < target_rows // 2:
        a, b = RNG.sample(base_usernames, 2)
        negatives.append([RNG.choice(username_variations(a)), RNG.choice(username_variations(b)), 0])

    rows = positives + negatives
    RNG.shuffle(rows)
    with (DATASETS / "username_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["left", "right", "label"])
        writer.writerows(rows[:target_rows])


def build_author_corpus(author: str, style: str, size: int = 220) -> list[str]:
    openings = [
        "I reviewed",
        "We mapped",
        "The team flagged",
        "Our platform correlated",
        "The scan identified",
        "I validated",
        "The workflow tracked",
        "We hardened",
    ]
    objects = [
        "identity signals",
        "username variants",
        "image reuse paths",
        "text artifacts",
        "graph neighborhoods",
        "threat vectors",
        "account clusters",
        "public footprints",
    ]
    outcomes = [
        "with explainable risk scores",
        "to improve confidence calibration",
        "before alert triage",
        "for autonomous defense actions",
        "to reduce impersonation exposure",
        "with deterministic evidence trails",
    ]
    connectors = ["therefore", "meanwhile", "however", "then", "additionally", "notably"]

    style_suffix = {
        "formal": ["; attribution requires evidence.", "; controls remain auditable.", "; governance notes appended."],
        "casual": [" and it worked great!", " so we shipped fast.", " and the squad was happy!"],
        "technical": ["; anomaly entropy crossed threshold.", "; posterior confidence improved.", "; signal gradient stabilized."],
        "concise": [".", ".", "."],
    }

    author_signature = author.replace("_", "")[-6:]
    author_lexicon = {
        "formal": ["attribution", "governance", "auditability", "evidence", "compliance", "integrity"],
        "casual": ["quick", "ship", "vibe", "team", "easy", "fast"],
        "technical": ["entropy", "posterior", "bayesian", "variance", "feature", "gradient"],
        "concise": ["clear", "direct", "minimal", "focused", "short", "precise"],
    }[style]

    outputs: list[str] = []
    for i in range(size):
        start = openings[i % len(openings)]
        obj = objects[(i * 3 + len(author)) % len(objects)]
        out = outcomes[(i * 5 + len(style)) % len(outcomes)]
        connector = connectors[(i * 7) % len(connectors)]
        tail = style_suffix[style][i % len(style_suffix[style])]
        lex = author_lexicon[(i * 11 + len(author)) % len(author_lexicon)]
        sentence = f"{start} {obj} {out}; {connector} analyst {author} tagged {lex} [sig:{author_signature}] {tail}"
        outputs.append(sentence)
    return outputs


def text_samples() -> dict[str, list[str]]:
    author_styles = {
        "author_formal_1": "formal",
        "author_formal_2": "formal",
        "author_casual_1": "casual",
        "author_casual_2": "casual",
        "author_tech_1": "technical",
        "author_tech_2": "technical",
        "author_concise_1": "concise",
        "author_concise_2": "concise",
        "author_formal_3": "formal",
        "author_casual_3": "casual",
    }
    return {author: build_author_corpus(author, style) for author, style in author_styles.items()}


def build_text_dataset(target_rows: int = TARGET_ROWS) -> None:
    authors = text_samples()
    keys = list(authors.keys())
    positives: list[list[object]] = []
    negatives: list[list[object]] = []

    while len(positives) < target_rows // 2:
        author = RNG.choice(keys)
        left, right = RNG.sample(authors[author], 2)
        positives.append([left, right, 1, author, author])

    while len(negatives) < target_rows // 2:
        a, b = RNG.sample(keys, 2)
        negatives.append([RNG.choice(authors[a]), RNG.choice(authors[b]), 0, a, b])

    rows = positives + negatives
    RNG.shuffle(rows)
    with (DATASETS / "text_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["left", "right", "label", "author_left", "author_right"])
        writer.writerows(rows[:target_rows])


def make_avatar(identity: str, variant: int) -> Path:
    size = 128
    seed = stable_hash_int(f"{identity}:{variant}")
    team = identity.split("_", 1)[0]
    palette = {
        "alpha": (220, 70, 70),
        "beta": (60, 190, 90),
        "delta": (60, 120, 220),
        "omega": (210, 160, 60),
        "sigma": (170, 80, 210),
        "lambda": (50, 180, 180),
        "ion": (230, 110, 170),
        "nova": (120, 210, 230),
        "quant": (235, 120, 60),
        "sentinel": (120, 120, 120),
    }
    base = palette.get(team, (80, 80, 80))
    jitter = ((seed % 21) - 10, ((seed // 5) % 21) - 10, ((seed // 9) % 21) - 10)
    bg = tuple(max(0, min(255, base[i] + jitter[i])) for i in range(3))
    accent = ((seed // 11) % 255, (seed // 13) % 255, (seed // 17) % 255)
    accent2 = ((seed // 19) % 255, (seed // 23) % 255, (seed // 29) % 255)

    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)

    pad = 8 + (variant * 3)
    draw.ellipse((pad, pad, size - pad, size - pad), outline=(255, 255, 255), width=3)
    draw.rectangle((size // 4, size // 4, (size * 3) // 4, (size * 3) // 4), outline=accent, width=2)
    # Identity-specific geometry pattern to increase same-identity embedding consistency.
    pattern = stable_hash_int(identity) % 3
    if pattern == 0:
        draw.line((10 + variant, 16, size - 16, size - 12 - variant), fill=accent2, width=3)
        draw.line((16, size - 18, size - 18, 14 + variant), fill=accent2, width=2)
    elif pattern == 1:
        draw.polygon([(size // 2, 12 + variant), (size - 14, size - 16), (14, size - 16)], outline=accent2, width=3)
    else:
        draw.arc((14, 14, size - 14, size - 14), start=20 + variant * 4, end=320 - variant * 3, fill=accent2, width=3)

    initials = "".join([x[0].upper() for x in identity.split("_")[:2]])
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    draw.text((size // 2 - 10, size // 2 - 7), initials, fill=(255, 255, 255), font=font)

    path = IMAGES / f"{identity}_{variant}.png"
    img.save(path)
    return path.resolve()


def generate_identities() -> list[str]:
    teams = [
        "alpha",
        "beta",
        "delta",
        "omega",
        "sigma",
        "lambda",
        "ion",
        "nova",
        "quant",
        "sentinel",
    ]
    roles = [
        "analyst",
        "researcher",
        "operator",
        "architect",
        "engineer",
        "observer",
        "specialist",
        "hunter",
        "defender",
        "watcher",
        "mapper",
        "guardian",
    ]
    return [f"{team}_{role}" for team in teams for role in roles]


def build_image_dataset(target_rows: int = TARGET_ROWS) -> None:
    identities = generate_identities()
    variants_per_identity = 4
    by_id: dict[str, list[Path]] = {}
    by_team: dict[str, list[str]] = {}

    for identity in identities:
        by_id[identity] = [make_avatar(identity, idx) for idx in range(variants_per_identity)]
        team = identity.split("_", 1)[0]
        by_team.setdefault(team, []).append(identity)

    positives: list[list[object]] = []
    negatives: list[list[object]] = []

    while len(positives) < target_rows // 2:
        identity = RNG.choice(identities)
        left, right = RNG.sample(by_id[identity], 2)
        positives.append([str(left), str(right), 1, identity, identity])

    while len(negatives) < target_rows // 2:
        team_a, team_b = RNG.sample(list(by_team.keys()), 2)
        a = RNG.choice(by_team[team_a])
        b = RNG.choice(by_team[team_b])
        negatives.append([str(RNG.choice(by_id[a])), str(RNG.choice(by_id[b])), 0, a, b])

    rows = positives + negatives
    RNG.shuffle(rows)
    with (DATASETS / "image_pairs.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["image_a", "image_b", "label", "identity_a", "identity_b"])
        writer.writerows(rows[:target_rows])


if __name__ == "__main__":
    ensure_dirs()
    build_username_dataset()
    build_text_dataset()
    build_image_dataset()
    print(f"Datasets generated under {DATASETS} with {TARGET_ROWS} rows per task")
