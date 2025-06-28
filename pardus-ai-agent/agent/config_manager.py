# agent/config_manager.py
import json
import os
from getpass import getpass

# Pardus ve genel Linux standartlarına uygun olarak, yapılandırma dosyasını
# kullanıcının ev dizinindeki .config klasörünün altına yerleştiriyoruz.
CONFIG_DIR = os.path.expanduser("~/.config/pardus-ai-agent")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")

def ensure_config_dir_exists():
    """
    Yapılandırma dizininin (~/.config/pardus-ai-agent/) var olduğundan emin olur.
    Eğer yoksa, oluşturur.
    """
    os.makedirs(CONFIG_DIR, exist_ok=True)

def save_config(api_key: str, model_name: str) -> dict:
    """
    Verilen API anahtarını ve model adını config.json dosyasına kaydeder.
    Geriye kaydedilen ayarları bir sözlük olarak döndürür.
    """
    ensure_config_dir_exists()
    config = {
        "api_key": api_key,
        "model_name": model_name
    }
    # 'w' modu ile dosyayı yazmak için açıyoruz. Dosya varsa üzerine yazar.
    with open(CONFIG_FILE, 'w') as f:
        # json.dump ile sözlüğü dosyaya JSON formatında yazıyoruz.
        # indent=4, dosyanın daha okunaklı olmasını sağlar.
        json.dump(config, f, indent=4)
    print(f"✅ Ayarlar başarıyla kaydedildi: {CONFIG_FILE}")
    return config

def load_config() -> dict or None:
    """
    config.json dosyasından ayarları yükler.
    Dosya bulunamazsa veya içeriği bozuksa None döndürür.
    Başarılı olursa, ayarları bir sözlük olarak döndürür.
    """
    if not os.path.exists(CONFIG_FILE):
        return None
    try:
        # 'r' modu ile dosyayı okumak için açıyoruz.
        with open(CONFIG_FILE, 'r') as f:
            # json.load ile JSON dosyasının içeriğini bir Python sözlüğüne çeviriyoruz.
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        # Dosya boşsa veya geçerli bir JSON değilse, None döndür.
        print(f"UYARI: Yapılandırma dosyası ({CONFIG_FILE}) bozuk veya okunamıyor. Yeni ayarlar istenecek.")
        return None

def prompt_for_config() -> dict:
    """
    Kullanıcıya interaktif olarak API anahtarını ve model tercihini sorar.
    Alınan cevapları kaydeder ve bir sözlük olarak döndürür.
    """
    print("\n--- Pardus AI Asistanı Kurulumu ---")
    print("Google AI Studio'dan (https://aistudio.google.com/app/apikey) bir API anahtarı almanız gerekmektedir.")
    
    # getpass kullanarak, kullanıcı API anahtarını yazarken ekranda görünmesini engelliyoruz.
    # Bu, temel bir güvenlik önlemidir.
    api_key = getpass("Lütfen Google AI API Anahtarınızı girin: ")
    
    print("\nHangi Gemini modelini kullanmak istersiniz?")
    print("1: Gemini 2.5 Flash (Daha hızlı ve günlük görevler için ideal)")
    print("2: Gemini 2.5 Pro - Bu model çalışmayabilir -  (Daha güçlü ve karmaşık görevler için)")
    
    model_choice = ""
    # Kullanıcı 1 veya 2 dışında bir şey girerse, tekrar sor.
    while model_choice not in ["1", "2"]:
        model_choice = input("Seçiminiz (1/2): ")

    # Gemini API'sinin en son modellerini kullanmak için 'latest' takısını ekliyoruz.
    # Bu, Google yeni bir sürüm çıkardığında kodumuzu değiştirmeden en güncel modeli
    # kullanmamızı sağlar.
    model_name = "models/gemini-2.5-flash" if model_choice == "1" else "models/gemini-2.5-pro"

    
    # Alınan bilgileri kaydetmek için save_config fonksiyonunu çağır.
    return save_config(api_key, model_name)