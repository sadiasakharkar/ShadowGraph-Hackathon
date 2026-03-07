# Identity Fingerprinting ML Pipelines

This phase implements three production-oriented ML pipelines in `ai-services`.

## Pipelines

1. Username Similarity Model
- Dataset: `ai-services/datasets/username_pairs.csv`
- Features: fuzzy/string encoder features
- Model: logistic regression
- Inference API: `POST /ai/username-similarity`

2. Image Identity Model
- Dataset: `ai-services/datasets/image_pairs.csv` + generated profile images under `ai-services/datasets/images/`
- Embeddings: ResNet18 feature embeddings (pretrained weights when available)
- Similarity: cosine + L2 features into logistic regression
- Inference API: `POST /ai/image-similarity`

3. Stylometric Text Model
- Dataset: `ai-services/datasets/text_pairs.csv`
- Features: sentence length, vocabulary distribution, punctuation patterns, uppercase ratio
- Model: logistic regression classifier
- Inference API: `POST /ai/text-similarity`

## Training and Evaluation

Run all:

```bash
cd ai-services
python training/train_all.py
```

Artifacts:
- Models: `ai-services/models/*.joblib`
- Reports: `ai-services/reports/*.json`, `ai-services/reports/evaluation_report.md`

Metrics reported per model:
- Precision
- Recall
- F1 score

## Deployment Integration

- AI service loads trained models from `ai-services/models`.
- Backend scan pipeline calls AI APIs and blends AI similarity scores into normalized confidence.
- Graph intelligence uses updated confidence to score suspicious nodes/edges.
