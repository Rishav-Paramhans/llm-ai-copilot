from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Load the LLaMA-2 model and tokenizer
model_name = "meta-llama/Llama-2-7b-chat-hf"  # Replace this with your LLaMA-2 model path or identifier
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Set the pad_token to eos_token
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

class SuggestionRequest(BaseModel):
    text: str

@app.post("/suggest")
async def suggest_code(request: SuggestionRequest):
    inputs = tokenizer(request.text, return_tensors="pt", padding=True, truncation=True).to(device)
    # Generate the output while setting pad_token_id to eos_token_id
    outputs = model.generate(
        inputs["input_ids"], 
        attention_mask=inputs["attention_mask"], 
        max_new_tokens=50, 
        pad_token_id=tokenizer.eos_token_id
    )
    suggestion = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"suggestion": suggestion}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
