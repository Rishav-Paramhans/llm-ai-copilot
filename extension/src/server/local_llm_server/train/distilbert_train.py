# Fine-tune the Model

from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, DistilBertTokenizer, DistilBertForSequenceClassification, TrainingArguments, Trainer
import torch
from torch.utils.data import Dataset
import json
class XOSCDataset(Dataset):
    def __init__(self, dataset, tokenizer, max_length=512):
        self.dataset = dataset
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        input_text = self.dataset[idx]['input']
        
        output_text = self.dataset[idx]['output']
        inputs = self.tokenizer(input_text, return_tensors='pt', max_length=self.max_length, truncation=True, padding='max_length')
        outputs = self.tokenizer(output_text, return_tensors='pt', max_length=self.max_length, truncation=True, padding='max_length')

        inputs['labels'] = outputs['input_ids']
        return inputs

# Load tokenizer and model
model_name = "distilbert-base-uncased"  # Replace this with your LLaMA-2 model path or identifier
tokenizer = DistilBertTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = DistilBertForSequenceClassification.from_pretrained(model_name, trust_remote_code=True)
print("model", model)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load dataset
with open(r"D:/Project/llm-ai-copilot/extension/src/server/local_llm_server/dataset/train/xosc/xosc_training_dataset.json", 'r') as f:
    dataset_json = json.load(f)

    # Create PyTorch dataset
    train_dataset = XOSCDataset(dataset_json, tokenizer)

    # Define training arguments
    training_args = TrainingArguments(
        output_dir='./results',
        num_train_epochs=3,
        per_device_train_batch_size=2,
        save_steps=10_000,
        save_total_limit=2,
    )

    # Create Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
    )

    # Fine-tune the model
    trainer.train()