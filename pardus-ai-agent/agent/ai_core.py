# agent/ai_core.py
import google.generativeai as genai

# --- PARDUS'A ÖZEL GELİŞMİŞ SİSTEM TALİMATI ---
# Bu metin, AI'ın nasıl davranacağını belirleyen anayasasıdır.
SYSTEM_PROMPT = """
Sen, 'Pardus Asistanı' adında, Pardus işletim sistemi (Debian tabanlı) ve Python konusunda uzman bir AI'sın.
Görevin, kullanıcının isteklerini analiz etmek, bir eylem planı oluşturmak ve bu planı gerçekleştirmek için Python betikleri üretmektir. Pardus'un komut satırı araçlarına ve yapısına hakimsin.

TEMEL PRENSİPLER:
1.  **Sistem Bilinci:** Her zaman bir Pardus sistemi üzerinde çalıştığını unutma. Bu, `apt` ile paket yönetimi, `/etc/` altındaki yapılandırma dosyaları ve genel Debian mimarisi anlamına gelir.
2.  **Güvenlik Önce Gelir:** Ürettiğin kod, kullanıcı tarafından onaylanacaktır. Tehlikeli olabilecek (`rm -rf` gibi) veya `sudo` gerektiren komutlar için kullanıcıyı kod içindeki yorumlarla veya print ifadeleriyle açıkça uyar.
3.  **Geri Bildirim Döngüsü:** Bir önceki komutun çıktısını (stdout/stderr) bir sonraki istemde bilgi olarak verilecektir. Bu çıktıyı kullanarak bir sonraki adımını planla. `apt install` komutu hata verirse, hatayı analiz et ve `apt update` çalıştırmayı öner.
4.  **Planlı Hareket Et:** Karmaşık görevleri adımlara böl. Düşünce sürecini (`'''...'''` bloğunda) bu planı içerecek şekilde açıkla.

KULLANABİLECEĞİN ARAÇLAR (PYTHON MODÜLLERİ):
- `os`: Dosya/dizin işlemleri için.
- `subprocess`: `apt`, `ls`, `systemctl`, `git` gibi harici Pardus komutlarını çalıştırmak için.
- `shutil`: Dosya kopyalama/taşıma/silme (`shutil.rmtree`) için.
- `requests`: Web'den veri çekmek için.
- `gitpython`: Git repolarını programatik olarak yönetmek için (`from git import Repo`).

CEVAP FORMATIN:
- **Eylem Gerekiyorsa:** Cevabını HER ZAMAN tek bir Python kod bloğu (```python ... ```) içinde ver.
- **Sohbet Gerekiyorsa:** Kullanıcıya bir soru sorman veya bilgi vermen gerekiyorsa, kod bloğu olmadan sade metin olarak cevap ver.

ÖRNEK İSTEK: "Pardus sistemime 'htop' aracını kur."

ÖRNEK CEVAP:
```python
'''
Plan:
1. Paket listesini güncellemek için `sudo apt update` komutunu çalıştıracağım.
2. 'htop' paketini kurmak için `sudo apt install -y htop` komutunu çalıştıracağım.
3. `sudo` gerektiren komutlar olduğu için kullanıcıyı uyaracağım.
Kod Açıklaması:
Bu betik, Pardus'ta bir paket kurmanın standart yolunu izler. Önce paket listelerini günceller, sonra paketi kurar. Hata kontrolü yaparak kullanıcıyı bilgilendirir.
'''
import subprocess
import sys

# UYARI: Bu betik, yönetici (sudo) yetkileri gerektiren komutlar içerir.
print("UYARI: Yönetici parolası istenebilir.")

try:
    print("Paket listeleri güncelleniyor...")
    # check=False, komut hata verse bile programın çökmesini engeller. Biz hatayı kendimiz yöneteceğiz.
    update_result = subprocess.run(['sudo', 'apt', 'update'], capture_output=True, text=True, check=False)
    if update_result.returncode != 0:
        print(f"❌ UYARI: `apt update` komutu hatalarla tamamlandı veya başarısız oldu.\\n{update_result.stderr}")
    else:
        print("✅ Paket listeleri güncellendi.")
        
    print("\\n'htop' kuruluyor...")
    install_result = subprocess.run(['sudo', 'apt', 'install', '-y', 'htop'], capture_output=True, text=True, check=False)
    
    if install_result.returncode != 0:
        print("❌ HATA: 'htop' kurulumu başarısız oldu.")
        print(install_result.stderr)
        sys.exit(1) # Kurulum başarısız olursa betik hata koduyla çıksın.
    else:
        print("✅ 'htop' başarıyla kuruldu! Terminalde 'htop' komutunu çalıştırabilirsiniz.")

except FileNotFoundError:
    print("❌ HATA: 'sudo' veya 'apt' komutu bulunamadı. Bu bir Pardus sistemi mi?")
    sys.exit(1)
except Exception as e:
    print(f"Beklenmedik bir hata oluştu: {e}")
    sys.exit(1)

"""


# 'model' adında, bu dosyanın her yerinden erişilebilecek bir değişken tanımlıyoruz.
model = None

def setup_model(api_key: str, model_name: str) -> bool:
    """
    Verilen API anahtarı ve model adı ile Gemini modelini başlatır.
    'SYSTEM_PROMPT'u AI'ın ana talimatı olarak ayarlar.
    
    Başarı durumunda True, hata durumunda False döndürür.
    """
    global model  # Bu fonksiyonun, dosya seviyesindeki 'model' değişkenini değiştireceğini belirtiyoruz.
    try:
        # API anahtarını Google kütüphanesine tanıtıyoruz.
        genai.configure(api_key=api_key)
        
        # Seçilen model adı ve sistem talimatı ile AI model nesnesini oluşturuyoruz.
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT
        )
        return True # İşlem başarılı.
    except Exception as e:
        # Bağlantı veya anahtar hatası gibi bir sorun olursa...
        print(f"❌ API veya Model hatası: Gemini modeli başlatılamadı. Lütfen API anahtarınızın geçerli ve internet bağlantınızın olduğundan emin olun. Hata: {e}")
        model = None # Modeli 'None' olarak bırak.
        return False # İşlem başarısız.


def generate_action(full_prompt: str, history: list) -> tuple[str, list]:
    """
    Verilen prompt ve sohbet geçmişine dayanarak AI'dan bir eylem (betik) veya 
    metin cevabı üretmesini ister.
    
    Geriye AI'ın ham metin cevabını ve güncellenmiş sohbet geçmişini döndürür.
    """
    # Eğer model kurulumu başarısız olduysa, hata mesajı döndür.
    if not model:
        return "HATA: AI modeli yüklenemedi. Lütfen uygulamayı --reconfigure ile yeniden yapılandırın.", history

    try:
        # 'start_chat' ile mevcut sohbet geçmişini vererek bağlamı koruyoruz.
        chat = model.start_chat(history=history)
        
        # Kullanıcının isteğini modele gönderiyoruz.
        response = chat.send_message(full_prompt)
        
        # Modelin cevabını ve yeni, güncellenmiş sohbet geçmişini döndürüyoruz.
        return response.text, chat.history
    except Exception as e:
        # AI ile iletişim sırasında bir sorun olursa (örn: internet kesintisi)...
        return f"AI ile iletişimde bir hata oluştu: {e}", history


def parse_response(text: str) -> tuple[str or None, str or None, str or None]:
    """
    AI tarafından üretilen ham metni analiz eder.
    
    Geriye üç değerden oluşan bir tuple döndürür: (plain_text, reasoning, code)
    - Eğer kod yoksa: ("Sadece metin cevabı", None, None)
    - Eğer kod varsa: (None, "AI'ın düşüncesi", "çalıştırılacak kod")
    """
    code_start_tag = "```python"
    code_end_tag = "```"
    
    start_index = text.find(code_start_tag)
    
    # Eğer metin içinde "```python" etiketi yoksa, bu bir kod bloğu değildir.
    if start_index == -1:
        return text, None, None # Gelen metni düz metin olarak döndür.

    # "```python" etiketinden sonraki "```" etiketini bul.
    end_index = text.find(code_end_tag, start_index + len(code_start_tag))
    
    # Eğer kapanış etiketi yoksa, kod bloğu bozuktur. Yine de düz metin olarak kabul et.
    if end_index == -1:
        return text, None, None

    # Kod bloğunun içeriğini tamamen al.
    code_content_full = text[start_index + len(code_start_tag):end_index].strip()
    
    reasoning = None
    code_to_execute = code_content_full

    # Eğer kod bloğunun içeriği ''' ile başlıyorsa, bu bir düşünce sürecidir.
    if code_to_execute.startswith("'''"):
        reasoning_end_tag = "'''"
        # Düşünce sürecinin bittiği yeri bul.
        r_end = code_to_execute.find(reasoning_end_tag, 3) # İlk 3 karakteri atla.
        if r_end != -1:
            # Düşünce sürecini ayıkla.
            reasoning = code_to_execute[3:r_end].strip()
            # Düşünce sürecini, çalıştırılacak asıl koddan temizle.
            code_to_execute = code_to_execute[r_end + len(reasoning_end_tag):].strip()
            
    # Sonucu döndür: plain_text=None, reasoning=Bulunan düşünce, code=Temizlenmiş kod.
    return None, reasoning, code_to_execute