# agent/archive_manager.py
import os
import datetime

# Tüm arşivlerin toplanacağı ana klasörün adı.
ARCHIVE_DIR = "agent_archive"

def ensure_archive_dir_exists():
    """
    Arşiv dizininin (agent_archive/) var olduğundan emin olur.
    Eğer yoksa, oluşturur.
    """
    os.makedirs(ARCHIVE_DIR, exist_ok=True)

def log_interaction(
    prompt: str,
    reasoning: str,
    code: str,
    stdout: str,
    stderr: str
):
    """
    Bir etkileşimin tüm detaylarını zaman damgalı bir klasöre kaydeder.
    
    Args:
        prompt (str): Kullanıcının orijinal isteği.
        reasoning (str): AI'ın düşünce süreci ve planı.
        code (str): AI tarafından üretilen ve çalıştırılan Python kodu.
        stdout (str): Çalıştırılan kodun standart çıktısı.
        stderr (str): Çalıştırılan kodun ürettiği hata mesajları.
    """
    try:
        ensure_archive_dir_exists()
        
        # Benzersiz ve sıralanabilir bir klasör adı için zaman damgası oluşturuyoruz.
        # Format: YYYYMMDD_HHMMSS (YılAyGün_SaatDakikaSaniye)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        session_dir = os.path.join(ARCHIVE_DIR, timestamp)
        os.makedirs(session_dir, exist_ok=True)

        # 1. Kullanıcının ne istediğini kaydet.
        with open(os.path.join(session_dir, "prompt.txt"), "w", encoding='utf-8') as f:
            f.write(prompt)
            
        # 2. AI'ın ne düşündüğünü ve hangi kodu ürettiğini kaydet.
        # Bu dosyanın uzantısını .py yaparak kodun renklendirilmesini kolaylaştırıyoruz.
        with open(os.path.join(session_dir, "reasoning_and_code.py"), "w", encoding='utf-8') as f:
            f.write(f"# --- AI Düşünce Süreci ---\n'''\n{reasoning}\n'''\n\n")
            f.write("# --- Üretilen Kod ---\n")
            f.write(code)

        # 3. Kodun çalıştırılması sonucunda ne olduğunu kaydet.
        with open(os.path.join(session_dir, "output.log"), "w", encoding='utf-8') as f:
            f.write("--- STDOUT (Standart Çıktı) ---\n")
            f.write(stdout)
            f.write("\n\n--- STDERR (Hata Çıktısı) ---\n")
            f.write(stderr)
            
        print(f"🗂️  Bu işlem şuraya arşivlendi: {session_dir}")

    except Exception as e:
        # Arşivleme sırasında bir hata olursa programın çökmesini engelle.
        # Sadece bir uyarı mesajı yazdır.
        print(f"UYARI: Arşivleme sırasında bir hata oluştu: {e}")