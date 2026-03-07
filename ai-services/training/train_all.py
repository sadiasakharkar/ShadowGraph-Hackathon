import json
from pathlib import Path

from build_datasets import ensure_dirs, build_username_dataset, build_text_dataset, build_image_dataset
from train_username_model import train as train_username
from train_text_model import train as train_text
from train_image_model import train as train_image

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"


def main() -> None:
    ensure_dirs()
    build_username_dataset()
    build_text_dataset()
    build_image_dataset()

    summary = {
        "username": train_username(),
        "text": train_text(),
        "image": train_image(),
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "evaluation_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    md = ["# Identity Fingerprinting Evaluation", ""]
    for key, value in summary.items():
        md.append(f"## {key.title()} Model")
        md.append(f"- Precision: {value['precision']}")
        md.append(f"- Recall: {value['recall']}")
        md.append(f"- F1: {value['f1']}")
        md.append("")
    (REPORTS / "evaluation_report.md").write_text("\n".join(md), encoding="utf-8")

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
