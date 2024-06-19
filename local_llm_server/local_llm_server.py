from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Load the model and tokenizer
model_name = "gpt2"  # You can replace this with any other model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

class SuggestionRequest(BaseModel):
    text: str

@app.post("/suggest")
async def suggest_code(request: SuggestionRequest):
    inputs = tokenizer(request.text, return_tensors="pt").to(device)
    outputs = model.generate(inputs["input_ids"], max_new_tokens=50)
    suggestion = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"suggestion": suggestion}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
