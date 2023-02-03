from typing import Dict, List
from fastapi import Depends, FastAPI
from pydantic import BaseModel
from twitter_sentiment.classifier.model import Model, get_model
import operator

app = FastAPI()
class SentimentRequest(BaseModel):
    text: List[str]
    id: List[str]

class SentimentResponse(BaseModel):
    id: List[str]
    probabilities: List[List[float]]
    sentiment: List[str]
    confidence: List[float]

@app.post("/predict", response_model=SentimentResponse)
def predict(request: SentimentRequest, model: Model = Depends(get_model)):
    if len(request.text) == 0:
        return SentimentResponse(id=[], sentiment=[], confidence=[], probabilities=[])
    confidence, sentiment, probabilities = model.predict(request.text)
    absolute_probabilities = [max(abs(x[0]), abs(x[1])) * confidence[idx] for idx,x in enumerate(probabilities)]
    indexes = list(range(len(probabilities)))
    indexes.sort(key=absolute_probabilities.__getitem__)

    id = list(map(request.id.__getitem__, indexes))[::-1]
    confidence = list(map(confidence.__getitem__, indexes))[::-1]
    sentiment = list(map(sentiment.__getitem__, indexes))[::-1]
    probabilities = list(map(probabilities.__getitem__, indexes))[::-1]
    return SentimentResponse(
        id=id, sentiment=sentiment, confidence=confidence, probabilities=probabilities
    )

# Run  uvicorn twitter_sentiment.api:app
"""
curl -X 'POST' \
  'http://127.0.0.1:8000/predict' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "text": "string"
}' 
curl -X 'POST' 'http://127.0.0.1:8000/predict' -H 'accept: application/json' -H 'Content-Type: application/json' -d '{"text": "string"}' 
 """