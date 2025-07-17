# --- AI Düşünce Süreci ---
'''
Plan:
1. Kullanıcıdan oluşturulacak klasörün adını alacağım.
2. `os.path.exists()` ile bu isme sahip bir klasörün zaten var olup olmadığını kontrol edeceğim.
3. Eğer klasör mevcut değilse, `os.makedirs()` kullanarak klasörü oluşturacağım.
4. İşlemin sonucunu (başarı/hata) kullanıcıya bildireceğim.

Kod Açıklaması:
Bu betik, Python'ın `os` modülünü kullanarak belirtilen bir dizini oluşturur. Kullanıcıdan klasör adını alır ve klasörün zaten var olup olmadığını kontrol ederek gereksiz işlem yapılmasını veya hata oluşmasını engeller.
'''

# --- Üretilen Kod ---
import os
import sys

def create_folder():
    folder_name = input("Oluşturmak istediğiniz klasörün adını girin: ").strip()

    if not folder_name:
        print("❌ HATA: Klasör adı boş bırakılamaz.")
        sys.exit(1)

    try:
        if os.path.exists(folder_name):
            print(f"⚠️ Uyarı: '{folder_name}' adında bir klasör veya dosya zaten mevcut. Yeni bir klasör oluşturulmadı.")
        else:
            os.makedirs(folder_name)
            print(f"✅ Klasör '{folder_name}' başarıyla oluşturuldu.")
            print(f"Oluşturulan klasörün tam yolu: {os.path.abspath(folder_name)}")
    except OSError as e:
        print(f"❌ HATA: Klasör oluşturulurken bir hata oluştu: {e}")
        print("Dizin oluşturma yetkiniz olmayabilir veya geçersiz bir karakter kullanmış olabilirsiniz.")
        sys.exit(1)
    except Exception as e:
        print(f"Beklenmedik bir hata oluştu: {e}")
        sys.exit(1)

create_folder()