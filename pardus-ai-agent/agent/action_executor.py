# agent/action_executor.py
import subprocess
import os

# Çalıştırılacak kod için oluşturulacak geçici dosyanın adı.
# Başına _ koymak, genellikle geçici veya dahili kullanım için olan
# dosyalarda kullanılan bir isimlendirme geleneğidir.
TEMP_SCRIPT_NAME = "_temp_pardus_agent_script.py"

def execute_script(python_code: str) -> tuple[str, str, int]:
    """
    Verilen Python kodunu geçici bir dosyaya yazar ve ayrı bir süreçte çalıştırır.
    
    Args:
        python_code (str): AI tarafından üretilen çalıştırılabilir Python kodu.
        
    Returns:
        tuple[str, str, int]: Bir tuple içinde şu üç değeri döndürür:
            - stdout (str): Betiğin standart çıktısı.
            - stderr (str): Betiğin standart hata çıktısı.
            - returncode (int): Betiğin çıkış kodu (0 ise başarılı).
    """
    # try...finally bloğu, işlem sırasında bir hata oluşsa bile
    # 'finally' kısmının her zaman çalışmasını garanti eder.
    # Bu, geçici dosyanın her durumda silinmesini sağlar.
    try:
        # 1. Kodu Geçici Dosyaya Yazma
        # 'w' (write) moduyla ve utf-8 kodlamasıyla dosyayı açıyoruz.
        # utf-8, Türkçe karakterler gibi uluslararası karakterlerin
        # sorunsuz yazılmasını sağlar.
        with open(TEMP_SCRIPT_NAME, "w", encoding='utf-8') as f:
            f.write(python_code)
        
        # 2. Ayrı Süreçte Çalıştırma ve Çıktıları Yakalama
        # subprocess.run() fonksiyonu, yeni bir komut çalıştırmak için kullanılır.
        result = subprocess.run(
            ["python3", TEMP_SCRIPT_NAME], # Çalıştırılacak komut ve argümanları.
            capture_output=True,           # stdout ve stderr'i yakalamak için True yapıyoruz.
            text=True,                     # Çıktıları metin (string) olarak almak için.
            encoding='utf-8'               # Çıktıların doğru kodlamayla okunmasını sağlar.
        )
        
        # 3. Sonuçları Döndürme
        # subprocess.run'ın döndürdüğü result nesnesinden çıktıları alıyoruz.
        return result.stdout, result.stderr, result.returncode

    except Exception as e:
        # Eğer dosya yazma veya subprocess başlatma sırasında bir hata olursa,
        # bu hatayı stderr olarak döndürerek ana programı bilgilendiriyoruz.
        return "", f"Ajan betik yürütme hatası: {e}", 1 # Hata kodu olarak 1 döndür.
        
    finally:
        # 4. Temizlik
        # Geçici betik dosyası hala mevcutsa, onu sil.
        if os.path.exists(TEMP_SCRIPT_NAME):
            os.remove(TEMP_SCRIPT_NAME)