# Pardus AI - Yerel Cihazda Çalışan OpenSource(Hugging Face) AI Modelleri

![Proje Logosu](assets/Pardus-Logo.png)

## 1. Amaç

Bu proje, kullanıcıların yerel cihazlarında çalışan açık kaynaklı (Hugging Face) yapay zeka modelleriyle etkileşim kurmasını sağlayan bir multimodal sohbet robotu ve bu sohbet robotuna güç veren bir yapay zeka arka ucu sunmayı amaçlamaktadır. Temel hedef, bulut tabanlı hizmetlere bağımlılığı azaltarak, gizliliği ve erişilebilirliği artıran, çevrimdışı çalışabilen bir yapay zeka deneyimi sunmaktır.

## 2. Problem

Günümüzdeki birçok yapay zeka uygulaması, veri işleme ve model çalıştırma için bulut tabanlı hizmetlere bağımlıdır. Bu durum, kullanıcı gizliliği, veri güvenliği ve internet bağlantısı gereksinimi gibi çeşitli sorunlara yol açabilir. Ayrıca, bazı kullanıcılar hassas verilerini üçüncü taraf sunucularına göndermek istemeyebilir veya sürekli internet erişimine sahip olmayabilir. Bu proje, bu tür bağımlılıkları ortadan kaldırarak, yapay zeka modellerinin yerel cihazlarda güvenli ve verimli bir şekilde çalıştırılabilmesi sorununu çözmeyi hedeflemektedir.

## 3. Yöntem

Proje, iki ana bileşenden oluşan bir mimari kullanmaktadır:

*   **Kullanıcı Arayüzü (Frontend)**: Kullanıcıların yapay zeka modelleriyle etkileşim kurmasını sağlayan, modern ve sezgisel bir arayüz sunar. Bu arayüz, metin, ses ve görüntü gibi farklı modalitelerde girdi alabilir ve çıktıları gösterebilir.
*   **Yapay Zeka Arka Ucu (AI Backend)**: Yerel cihazda çalışan açık kaynaklı (Hugging Face) yapay zeka modellerini barındırır ve yönetir. Kullanıcı arayüzünden gelen istekleri işler, ilgili yapay zeka modellerini çalıştırır ve sonuçları geri döndürür. Bu yaklaşım, veri gizliliğini korurken, çevrimdışı çalışma yeteneği sağlar.

## 4. Kullanılan Teknolojiler

### Frontend (multimodal-ai-chatbot)

*   **React**: Kullanıcı arayüzü geliştirmek için kullanılan JavaScript kütüphanesi.
*   **TypeScript**: Daha güvenli ve ölçeklenebilir kod yazmak için kullanılan JavaScript'in tip güvenli bir üst kümesi.
*   **Vite**: Hızlı geliştirme deneyimi sunan yeni nesil bir frontend derleme aracı.
*   **Electron**: Web teknolojileri (HTML, CSS, JavaScript) kullanarak masaüstü uygulamaları geliştirmek için kullanılan bir framework.

### AI Backend (multimodal-ai-chatbot-AI-backend)

*   **Python**: Yapay zeka modellerinin geliştirilmesi ve çalıştırılması için ana programlama dili.
*   **Jupyter Notebooks**: Model geliştirme, deney ve veri analizi için kullanılan etkileşimli bir ortam (`Pardus.ipynb`, `PardusRun.ipynb`).
*   **Hugging Face Transformers**: Çeşitli önceden eğitilmiş yapay zeka modellerine erişim ve bunları kullanma imkanı sunan kütüphane. (Proje açıklamasından çıkarılmıştır)
*   **Diğer Python Kütüphaneleri**: Ses işleme, görüntü işleme ve diğer yapay zeka görevleri için gerekli olabilecek kütüphaneler (örneğin, `soundfile`, `Pillow`, `numpy` vb.).

## 5. Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edin:

### Genel Kurulum

1.  **Depoyu Klonlayın**:
    ```bash
    git clone https://github.com/your-username/pardus-projeler-teknofest-2025.git
    cd pardus-projeler-teknofest-2025
    ```

### Frontend Kurulumu (multimodal-ai-chatbot)

1.  **Dizinine Gidin**:
    ```bash
    cd multimodal-ai-chatbot
    ```
2.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    ```
3.  **Uygulamayı Başlatın (Geliştirme Modu)**:
    ```bash
    npm run dev
    ```
    veya
    ```bash
    npm run build && electron .
    ```

### AI Backend Kurulumu (multimodal-ai-chatbot-AI-backend)

1.  **Dizinine Gidin**:
    ```bash
    cd multimodal-ai-chatbot-AI-backend
    ```
2.  **Gerekli Python Kütüphanelerini Yükleyin**:
    ```bash
    pip install -r requirements.txt # Eğer requirements.txt dosyası varsa
    # veya
    # pip install transformers torch # Örnek olarak, kullanılan kütüphanelere göre değişir
    ```
    *Not: `requirements.txt` dosyası mevcut değilse, Jupyter Notebook'larda kullanılan kütüphaneleri manuel olarak yüklemeniz gerekebilir.*

3.  **Jupyter Notebook'ları Çalıştırın (İsteğe Bağlı)**:
    ```bash
    jupyter notebook
    ```
    Ardından `Pardus.ipynb` veya `PardusRun.ipynb` dosyalarını açarak modelleri çalıştırabilirsiniz.

## 6. Takım Bilgisi

*   **Danışman**: Mehmet Akınol
*   **Üye**: Denizhan Şahin
*   **Başvuru ID**: 3078008
*   **Takım ID**: 577125
*   **Takım Adı**: Space Teknopoli Linux Team
*   **Yarışma Adı**: 2025 Pardus Hata Yakalama ve Öneri Yarışması Geliştirme Kategorisi
