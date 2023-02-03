import json as pyjson

import os
import torch
import pandas as pd
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer

with open("C:/Users/leish/Projects/StockSentimentAnalysis/model-server/twitter_sentiment/classifier/config.json") as f:
    config = pyjson.load(f)

class TextDataset:
    def __init__(self, tokenized_texts):
        self.tokenized_texts = tokenized_texts

    def __len__(self):
        return len(self.tokenized_texts["input_ids"])

    def __getitem__(self, idx):
        return {k: v[idx] for k, v in self.tokenized_texts.items()}

class Model:
    def __init__(self):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(config['BERT_MODEL'])
        self.model = AutoModelForSequenceClassification.from_pretrained(config['BERT_MODEL'])
        self.trainer = Trainer(model=self.model)

    def predict(self, texts):
        tokenized_texts = self.tokenizer(texts, truncation=True, padding=True)
        pred_dataset = TextDataset(tokenized_texts)

        # Run predictions
        predictions = self.trainer.predict(pred_dataset)

        # Transform predictions to labels
        preds = predictions.predictions.argmax(-1).tolist()
        labels = pd.Series(preds).map(self.model.config.id2label).values.tolist()
        scores = (np.exp(predictions[0]) / np.exp(predictions[0]).sum(-1, keepdims=True)).max(1).tolist()
        probabilities = predictions.predictions.tolist()
        print("PREDS", preds)
        print("LABELS", labels)
        print("SCORES", scores)
        print("PROBABILITIES", probabilities)
        return (
            scores,
            labels,
            probabilities
        )

model = Model()

def get_model():
    return model

if __name__ == "__main__":
    scores,labels,predictions = model.predict(["Tesla is bad", "Tesla is Good"])
    print(predictions)
    print("\n")
    print(labels)
    print("\n")
    print(scores)