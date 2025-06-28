# agent/main.py
import sys
import os
from colorama import init, Fore, Style

# Projemizdeki diğer modülleri içeri aktarıyoruz.
# '.' (nokta) ifadesi, "bu paket içindeki" anlamına gelir.
from . import config_manager
from . import ai_core
from . import action_executor
from . import archive_manager

# colorama'yı başlatarak Windows'ta da renklerin çalışmasını sağlıyoruz.
# autoreset=True ile her print sonrası renkler otomatik sıfırlanır.
init(autoreset=True)

# Kodun daha okunaklı olması için renkleri bir sınıfta topluyoruz.
class Renkler:
    BASLIK = Style.BRIGHT + Fore.CYAN
    UYARI = Fore.YELLOW
    HATA = Fore.RED
    BASARI = Fore.GREEN
    BILGI = Fore.BLUE
    KULLANICI = Style.BRIGHT
    RESET = Style.RESET_ALL

def print_welcome_message():
    """Asistan başladığında kullanıcıyı karşılayan mesajı basar."""
    print(Renkler.BASLIK + "--- Pardus AI Asistanı'na Hoş Geldiniz ---")
    print("Görevlerinizi belirtin, sizin için bir eylem planı ve betik hazırlayayım.")
    print("Dahili komutlar için " + Renkler.BILGI + "/help" + Renkler.RESET + " yazın.")

def print_help():
    """/help komutuyla çağrılan yardım menüsünü basar."""
    print(f"""
{Style.BRIGHT}Dahili Komutlar:{Renkler.RESET}
  {Renkler.BILGI}/help{Renkler.RESET}           : Bu yardım mesajını gösterir.
  {Renkler.BILGI}/reconfigure{Renkler.RESET}    : API anahtarını ve modeli yeniden yapılandırır.
  {Renkler.BILGI}/cwd{Renkler.RESET}            : Mevcut çalışma dizinini gösterir.
  {Renkler.BILGI}/clear{Renkler.RESET}          : Sohbet geçmişini temizler ve asistanı sıfırlar.
  {Renkler.BILGI}/exit, /quit{Renkler.RESET}    : Asistanı sonlandırır.
    """)

def handle_internal_command(prompt, history):
    """
    Kullanıcının girdiği komutun dahili bir komut olup olmadığını kontrol eder.
    Eğer öyleyse, işlemi yapar ve (True, güncel_geçmiş) döndürür.
    Değilse, (False, history) döndürür.
    """
    cmd = prompt.lower().strip()
    if cmd in ["/exit", "/quit", "exit", "quit"]:
        print(Renkler.UYARI + "👋 Hoşça kalın!"); sys.exit(0)
    if cmd == "/help":
        print_help()
        return True, history
    if cmd == "/reconfigure":
        config_manager.prompt_for_config()
        print(Renkler.BASARI + "✅ Yapılandırma güncellendi. Asistanı yeniden başlatın."); sys.exit(0)
    if cmd == "/cwd":
        print(Renkler.BILGI + f"Mevcut Dizin: {os.getcwd()}")
        return True, history
    if cmd == "/clear":
        os.system('clear') # Terminali temizle
        print_welcome_message()
        print(Renkler.BASARI + "Sohbet geçmişi temizlendi.")
        return True, [] # Sohbet geçmişini sıfırla
    return False, history

def main():
    """Ana uygulama fonksiyonu. setup.py tarafından çağrılır."""
    # Program --reconfigure argümanıyla başlatıldıysa, yapılandırmayı sor ve çık.
    if "--reconfigure" in sys.argv:
        config_manager.prompt_for_config()
        sys.exit(0)

    # Ayarları yüklemeye çalış. Yoksa, kullanıcıdan yeni ayar iste.
    config = config_manager.load_config() or config_manager.prompt_for_config()
    
    # AI modelini yükle. Başarısız olursa, programdan çık.
    if not ai_core.setup_model(config['api_key'], config['model_name']):
        sys.exit(1)
    
    print_welcome_message()
    print(f"🤖 Model {Style.BRIGHT}{config['model_name']}{Renkler.RESET} ile hizmetinizde.")
    
    # Sohbet geçmişini ve son komutun çıktısını tutacak değişkenleri başlat.
    conversation_history = []
    last_command_output = "Yok (ilk komut)."

    # Ana uygulama döngüsü
    while True:
        try:
            # Kullanıcıya gösterilecek olan şık prompt'u oluştur.
            current_dir = os.path.basename(os.getcwd())
            user_prompt = input(f"\n{Renkler.KULLANICI}({current_dir}) Pardus 👤 >{Renkler.RESET} ")
            
            # Girilen komutun dahili bir komut olup olmadığını kontrol et.
            is_internal, conversation_history = handle_internal_command(user_prompt, conversation_history)
            if is_internal:
                continue # Eğer dahili komutsa, AI'a gitmeden döngünün başına dön.

            # === GERİ BİLDİRİM DÖNGÜSÜ ===
            # AI'a göndereceğimiz tam prompt'u oluşturuyoruz.
            # Bu, AI'ın bir önceki işlemin sonucundan haberdar olmasını sağlar.
            full_prompt = (
                f"Kullanıcı İsteği: {user_prompt}\n\n"
                f"Önceki Komutun Çıktısı (stdout/stderr):\n---\n{last_command_output}\n---"
            )
            
            print(Renkler.BILGI + "🤖 Pardus Asistanı düşünüyor...")
            # AI'dan bir eylem üretmesini iste ve sohbet geçmişini güncelle.
            response_text, conversation_history = ai_core.generate_action(full_prompt, conversation_history)
            
            # AI'ın cevabını analiz et: düz metin mi, yoksa kod mu?
            plain_text, reasoning, code = ai_core.parse_response(response_text)

            if code:
                # Eğer AI bir kod bloğu ürettiyse...
                print(f"\n{Renkler.BASLIK}🤖 Asistan'ın Eylem Planı:{Renkler.RESET}")
                if reasoning:
                    print(f"{Style.BRIGHT}Düşünce Süreci:{Renkler.RESET}\n{reasoning}")
                print(f"\n{Style.BRIGHT}Önerilen Betik:{Renkler.RESET}\n{Renkler.BASARI}{code}{Renkler.RESET}")
                
                # Kullanıcıdan betiği çalıştırmak için onay iste.
                confirm = input(f"{Renkler.UYARI}Bu betiği çalıştırmak istiyor musunuz? [y/N]: {Renkler.RESET}")
                if confirm.lower() == 'y':
                    print(f"\n{Renkler.BILGI}🚀 Betik çalıştırılıyor...{Renkler.RESET}")
                    # Betiği çalıştır ve çıktılarını al.
                    stdout, stderr, returncode = action_executor.execute_script(code)
                    # Bir sonraki istek için geri bildirim değişkenini güncelle.
                    last_command_output = f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}"
                    
                    print(f"\n{Style.BRIGHT}--- ÇIKTI (STDOUT) ---{Renkler.RESET}\n{stdout or '[Boş]'}")
                    if stderr:
                        print(f"\n{Style.BRIGHT}{Renkler.HATA}--- HATA (STDERR) ---{Renkler.RESET}\n{stderr}")
                    
                    print(f"{Renkler.BASARI}✅ Betik tamamlandı. (Çıkış Kodu: {returncode}){Renkler.RESET}")
                    # Tüm etkileşimi arşive kaydet.
                    archive_manager.log_interaction(user_prompt, reasoning or "Yok", code, stdout, stderr)
                else:
                    print(Renkler.UYARI + "✋ İşlem iptal edildi.")
                    last_command_output = "Kullanıcı işlemi iptal etti."
            else:
                # Eğer AI sadece sohbet ettiyse, cevabını ekrana bas.
                print(f"\n{Renkler.BILGI}🤖 Pardus Asistanı: {plain_text}{Renkler.RESET}")
                last_command_output = "Asistan bir betik üretmedi, sadece konuştu."
        except (KeyboardInterrupt, EOFError):
            # Ctrl+C veya Ctrl+D ile çıkış yapıldığında...
            print(f"\n{Renkler.UYARI}👋 Hoşça kalın!");
            break
        except Exception as e:
            # Beklenmedik bir hata oluşursa programın çökmesini engelle.
            print(f"\n{Renkler.HATA}Beklenmedik bir hata oluştu: {e}")

# Bu dosya doğrudan çalıştırılırsa main() fonksiyonunu çağırır.
# Ancak bizim projemizde asıl çağrı setup.py'daki entry_point üzerinden yapılır.
if __name__ == "__main__":
    main()