import os
os.environ["HUGGING_FACE_HUB_TOKEN"] = "senin token" 

from transformers import AutoTokenizer, AutoModelForCausalLM

# Model ve tokenizer'ı yükle
model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Yerel dizine kaydet
save_directory = "./deepseek-14B"  # Kaydedilecek klasör
model.save_pretrained(save_directory)
tokenizer.save_pretrained(save_directory)