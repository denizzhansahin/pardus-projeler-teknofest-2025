# --- AI Düşünce Süreci ---
'''
Plan:
1.  `pardus_txt` adında bir klasör oluşturacağım. Eğer bu klasör zaten varsa, sorunsuz bir şekilde devam etmeli veya kullanıcıya bilgi vermelidir.
2.  Süper Lig takımlarına ait 20 farklı takım bilgisi veri yapısı oluşturacağım.
3.  Oluşturulan klasörün içine, her bir takım bilgisi için ayrı bir TXT dosyası oluşturacağım.
4.  Her bir TXT dosyasının içine, ilgili takım hakkında basit bir bilgi metni yazacağım.
5.  Oluşturma işlemleri sırasında oluşabilecek hataları (dizin oluşturma, dosya yazma) yöneteceğim.

Kod Açıklaması:
Bu betik, `os` modülünü kullanarak dosya sistemi işlemleri gerçekleştirir.
- `os.makedirs()` ile belirtilen klasörü oluşturur. `exist_ok=True` parametresi sayesinde, klasör zaten varsa hata vermez.
- Önceden tanımlanmış 20 Süper Lig takımının bilgilerini içeren bir liste kullanır.
- Her takım için bir döngü başlatır, dosya adını (örn. `Galatasaray.txt`) oluşturur ve içine takım bilgilerini yazar.
- İşlem tamamlandığında kullanıcıya başarılı veya hatalı durum hakkında bilgi verir.
'''

# --- Üretilen Kod ---
import os
import sys

# Oluşturulacak klasörün adı
directory_name = "pardus_txt"

# Süper Lig takımları ve temel bilgileri (20 adet)
teams_info = [
    {"name": "Galatasaray", "colors": "Sarı-Kırmızı", "founded": 1905, "city": "İstanbul"},
    {"name": "Fenerbahçe", "colors": "Sarı-Lacivert", "founded": 1907, "city": "İstanbul"},
    {"name": "Beşiktaş", "colors": "Siyah-Beyaz", "founded": 1903, "city": "İstanbul"},
    {"name": "Trabzonspor", "colors": "Bordo-Mavi", "founded": 1967, "city": "Trabzon"},
    {"name": "Başakşehir", "colors": "Turuncu-Lacivert", "founded": 1990, "city": "İstanbul"},
    {"name": "Adana Demirspor", "colors": "Mavi-Lacivert", "founded": 1940, "city": "Adana"},
    {"name": "Konyaspor", "colors": "Yeşil-Beyaz", "founded": 1922, "city": "Konya"},
    {"name": "Antalyaspor", "colors": "Kırmızı-Beyaz", "founded": 1966, "city": "Antalya"},
    {"name": "Kayserispor", "colors": "Sarı-Kırmızı", "founded": 1966, "city": "Kayseri"},
    {"name": "Sivasspor", "colors": "Kırmızı-Beyaz", "founded": 1967, "city": "Sivas"},
    {"name": "Alanyaspor", "colors": "Turuncu-Yeşil", "founded": 1948, "city": "Alanya"},
    {"name": "Hatayspor", "colors": "Bordo-Beyaz", "founded": 1967, "city": "Hatay"},
    {"name": "Gaziantep FK", "colors": "Kırmızı-Siyah", "founded": 1988, "city": "Gaziantep"},
    {"name": "Ankaragücü", "colors": "Sarı-Lacivert", "founded": 1910, "city": "Ankara"},
    {"name": "İstanbulspor", "colors": "Sarı-Siyah", "founded": 1926, "city": "İstanbul"},
    {"name": "Ümraniyespor", "colors": "Kırmızı-Beyaz", "founded": 1938, "city": "İstanbul"},
    {"name": "Fatih Karagümrük", "colors": "Kırmızı-Siyah", "founded": 1926, "city": "İstanbul"},
    {"name": "Samsunspor", "colors": "Kırmızı-Beyaz", "founded": 1965, "city": "Samsun"},
    {"name": "Çaykur Rizespor", "colors": "Yeşil-Mavi", "founded": 1953, "city": "Rize"},
    {"name": "Pendikspor", "colors": "Kırmızı-Beyaz", "founded": 1950, "city": "İstanbul"}
]

try:
    # Klasörü oluştur
    print(f"'{directory_name}' klasörü oluşturuluyor...")
    os.makedirs(directory_name, exist_ok=True)
    print(f"✅ '{directory_name}' klasörü başarıyla oluşturuldu veya zaten mevcut.")

    created_files_count = 0
    print(f"\n'{directory_name}' klasörüne TXT dosyaları ekleniyor...")
    for team in teams_info:
        file_name = f"{team['name'].replace(' ', '_').replace('.', '')}.txt" # Dosya adında boşluk ve özel karakterleri değiştir
        file_path = os.path.join(directory_name, file_name)
        
        file_content = (
            f"{team['name']} Süper Lig Takım Bilgileri\n"
            f"-----------------------------------------\n"
            f"Şehir: {team['city']}\n"
            f"Kuruluş Yılı: {team['founded']}\n"
            f"Takım Renkleri: {team['colors']}\n"
            f"Bu dosya, Süper Lig'in köklü veya yeni takımlarından {team['name']} hakkında temel bilgileri içermektedir."
        )

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            print(f"  - '{file_name}' dosyası oluşturuldu.")
            created_files_count += 1
        except IOError as e:
            print(f"❌ HATA: '{file_name}' dosyası oluşturulurken bir hata oluştu: {e}")
            # Hata durumunda bile diğer dosyaları oluşturmaya devam et
        except Exception as e:
            print(f"❌ Beklenmedik bir hata oluştu: {e}")
            # Hata durumunda bile diğer dosyaları oluşturmaya devam et

    if created_files_count == len(teams_info):
        print(f"\n✅ Tüm {created_files_count} adet TXT dosyası '{directory_name}' klasörüne başarıyla eklendi.")
        print(f"Dosyaları listelemek için: 'ls {directory_name}' komutunu kullanabilirsiniz.")
    elif created_files_count > 0:
        print(f"\n⚠️ {created_files_count} adet TXT dosyası başarıyla eklendi, ancak bazı dosyalarda hata oluşmuş olabilir.")
    else:
        print(f"\n❌ Hiçbir TXT dosyası oluşturulamadı.")

except OSError as e:
    print(f"❌ HATA: Klasör oluşturulurken bir işletim sistemi hatası oluştu: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Beklenmedik bir hata oluştu: {e}")
    sys.exit(1)