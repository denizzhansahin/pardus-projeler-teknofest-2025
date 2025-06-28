# Pardus AI Asistanı

![Pardus Logo](https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-04.png)

**Pardus AI Asistanı**, milli işletim sistemimiz Pardus için özel olarak geliştirilmiş, Google Gemini 1.5 destekli, akıllı bir komut satırı asistanıdır. Amacı, geliştirme ve sistem yönetimi görevlerini basitleştirmek, otomatize etmek ve Pardus kullanıcılarına güçlü bir AI yardımcısı sunmaktır.

Asistan, kullanıcı isteklerini doğal dilde anlar, bu istekleri gerçekleştirmek için bir eylem planı oluşturur ve bu planı uygulamak üzere güvenli Python betikleri üretir.

## 🚀 Temel Özellikler

*   **Pardus Odaklı:** Sistem komutları ve paket yönetimi (`apt`) gibi konularda Pardus (Debian tabanlı) mimarisine aşinadır.
*   **Akıllı Betik Üretimi:** "Bir web sunucusu kur", "proje dosyalarımı yedekle" veya "sistem kaynaklarını göster" gibi karmaşık istekleri anlar ve bunları gerçekleştirmek için `bash` veya `python` betikleri üretir.
*   **Tam Kontrol ve Güvenlik:** Üretilen hiçbir betik, siz kodu inceleyip **onay vermeden** asla çalıştırılmaz. Bu, sisteminizin güvenliğini en üst düzeyde tutar.
*   **Öğrenen Hafıza:** Önceki komutların sonucunu (başarı veya hata) bir sonraki adımını planlamak için kullanarak çok aşamalı görevleri (örneğin: klasör oluştur -> içine gir -> dosya yarat) başarıyla tamamlayabilir.
*   **Şeffaf Arşivleme:** Tüm etkileşimler (sizin isteğiniz, AI'ın düşünce süreci, ürettiği kod ve kodun sonucu) `agent_archive` klasöründe zaman damgalı olarak saklanır. Bu, hata ayıklama ve geçmişi inceleme için mükemmeldir.
*   **Kolay Kurulum:** Standart Python paket yöneticisi `pip` ile kolayca kurulur ve terminalde `pardus-ai-agent` komutuyla her yerden erişilebilir.
*   **Kullanıcı Dostu Arayüz:** Renklendirilmiş terminal çıktıları ve `/help`, `/cwd` gibi dahili komutlarla kolay bir kullanım sunar.

## 🛠️ Kurulum

Asistanı kurmak için aşağıdaki adımları takip edin.

### Gereksinimler
*   Pardus İşletim Sistemi
*   Python 3.8 veya üzeri (`python3 --version` ile kontrol edebilirsiniz)
*   Google AI Studio'dan alınmış bir API Anahtarı

### Adım 1: Proje Ortamını Hazırlama

Bir terminal açın ve aşağıdaki komutları sırasıyla çalıştırın.

1.  **Gerekli paketi kurun:**
    ```bash
    sudo apt update
    sudo apt install python3-venv -y
    ```
2.  **Proje dosyalarını indirin veya klonlayın:**
    ```bash
    git clone [PROJENİZİN_GITHUB_URL'Sİ]
    cd pardus-ai-agent
    ```
    *(Eğer projeyi klonlamadıysanız, dosyaları bir klasöre koyup o klasörün içine girin.)*

3.  **Python sanal ortamını oluşturun ve aktifleştirin:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
    *(Terminal satırınızın başında `(venv)` yazısını görmelisiniz.)*

### Adım 2: Bağımlılıkları ve Asistanı Kurma

1.  **Gerekli kütüphaneleri kurun:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Pardus AI Asistanı'nı sisteme kurun:**
    ```bash
    pip install -e .
    ```
    *(`-e` bayrağı, kodda yaptığınız değişikliklerin anında yansımasını sağlar.)*

## 🚀 Kullanım

Kurulum tamamlandı! Artık asistanı kullanmaya başlayabilirsiniz.

1.  **İlk Çalıştırma:**
    Terminalde aşağıdaki komutu çalıştırın:
    ```bash
    pardus-ai-agent
    ```
    Program ilk kez çalıştığında sizden **Google AI API Anahtarınızı** ve kullanmak istediğiniz **Gemini modelini** (Flash veya Pro) isteyecektir. Bu bilgiler `~/.config/pardus-ai-agent/config.json` dosyasına kaydedilecektir.

2.  **Asistan ile Etkileşim:**
    Kurulumdan sonra asistan sizden komut bekleyecektir. Doğal bir dilde isteklerinizi yazabilirsiniz.

    **Örnek 1: Paket Kurma**
    ```
    (pardus-ai-projesi) Pardus 👤 > bana neofetch aracını kurar mısın
    ```

    **Örnek 2: Dosya İşlemleri**
    ```
    (pardus-ai-projesi) Pardus 👤 > belgelerim klasöründe 'test' adında bir alt klasör oluştur
    ```

    **Örnek 3: Sistem Bilgisi**
    ```
    (pardus-ai-projesi) Pardus 👤 > disk kullanım durumunu gösteren bir betik yaz
    ```

3.  **Dahili Komutlar:**
    Asistanın AI'a sormadan direkt çalıştırdığı özel komutları vardır. Bunları görmek için `/help` yazmanız yeterlidir.
    ```
    (pardus-ai-projesi) Pardus 👤 > /help
    ```
    *   `/reconfigure`: Ayarları yeniden yapmak için kullanılır.
    *   `/cwd`: Mevcut çalışma dizinini gösterir.
    *   `/clear`: Sohbet geçmişini temizler.
    *   `/exit`: Asistanı sonlandırır.

## ⚠️ ÖNEMLİ GÜVENLİK UYARISI

Bu araç, AI tarafından üretilen ve potansiyel olarak **sistem komutları** (`sudo apt`, `rm` vb.) içeren kodları çalıştırır. Asistan, kodu çalıştırmadan önce **her zaman size kodu gösterir ve onayınızı ister**.

**LÜTFEN SİZE SUNULAN KODU DİKKATLİCE İNCELEMEDEN ASLA 'y' YAZARAK ONAYLAMAYIN!**

Bu aracın kullanımından doğacak her türlü sorumluluk tamamen kullanıcıya aittir. Güvenliğiniz için, ne yaptığını anlamadığınız kodları çalıştırmaktan kaçının.

## 🤝 Katkıda Bulunma

Bu proje açık kaynaklıdır ve katkılarınıza açıktır. Fork'layabilir, yeni özellikler ekleyebilir ve Pull Request gönderebilirsiniz.