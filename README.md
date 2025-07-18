# Space Teknopoli Linux Team - 2025 Pardus Hata Yakalama ve Öneri Yarışması Geliştirme Kategorisi

## Takım Bilgisi
*   **Üyeler**: Denizhan Şahin, Mehmet Akınol
*   **Başvuru ID**: 3078008
*   **Takım ID**: 577125
*   **Takım Adı**: Space Teknopoli Linux Team
*   **Yarışma Adı**: 2025 Pardus Hata Yakalama ve Öneri Yarışması Geliştirme Kategorisi

## Proje Yönetimi ve Dokümantasyon

Proje ilerlememizi, görevlerimizi ve detaylı dokümantasyonumuzu takip etmek için DeepWiki platformunu kullanıyoruz. Tüm proje detaylarına aşağıdaki bağlantıdan ulaşabilirsiniz:

[DeepWiki Adresimiz](https://deepwiki.com/denizzhansahin/pardus-projeler-teknofest-2025)




## Projelerimize Genel Bakış

Bu depo, 2025 Pardus Hata Yakalama ve Öneri Yarışması Geliştirme Kategorisi için geliştirdiğimiz çeşitli yenilikçi projeleri içermektedir. Amacımız, Pardus işletim sistemi kullanıcılarının deneyimini zenginleştirmek, günlük görevlerini kolaylaştırmak, verimliliklerini artırmak ve yapay zeka destekli çözümlerle geleceğin teknolojilerini bugünden sunmaktır. Projelerimizin çoğu, modern web teknolojileri (React, TypeScript) ve Electron çerçevesi kullanılarak platformlar arası uyumlu masaüstü uygulamaları olarak geliştirilmiş olup, Google Gemini API entegrasyonu sayesinde güçlü yapay zeka yetenekleri kazanmıştır.

Aşağıda, her bir projemizin detaylı açıklamaları, çözdüğü problemler, kullanılan yöntemler ve teknolojik altyapıları bulunmaktadır:

---

## Asıl Projeler: Yapay Zeka Destekli Çekirdek Uygulamalar

Bu bölümde, Pardus ekosistemine doğrudan entegre olan ve yapay zeka yetenekleriyle zenginleştirilmiş ana projelerimiz detaylandırılmıştır. Bu projeler, kullanıcı deneyimini dönüştürmeyi ve günlük etkileşimleri daha akıllı hale getirmeyi hedefler.

### 1. flowmind-pardus

**Açıklama**: `flowmind-pardus`, Pardus işletim sistemi kullanıcıları için özel olarak tasarlanmış, görsel düşünme ve organizasyon süreçlerini kolaylaştırmayı hedefleyen bir masaüstü uygulamasıdır. Proje, kullanıcıların fikirlerini, süreçlerini veya herhangi bir kavramsal yapıyı akış şemaları ve zihin haritaları şeklinde görselleştirmelerine olanak tanır.

**Çözdüğü Problem**: Geleneksel not alma veya metin tabanlı planlama yöntemleri, karmaşık fikirlerin veya süreçlerin görselleştirilmesinde yetersiz kalabilir. Kullanıcılar, düşüncelerini daha yapılandırılmış ve anlaşılır bir biçimde ifade etmekte zorlanabilirler. `flowmind-pardus`, bu boşluğu doldurarak, görsel öğrenenler ve karmaşık sistemleri tasarlayanlar için sezgisel bir platform sunar.

**Yöntem**: Uygulama, modern web teknolojileri olan React ve Vite kullanılarak geliştirilmiştir. Electron çerçevesi sayesinde, web tabanlı bu arayüz güçlü bir masaüstü uygulamasına dönüştürülmüştür. Projenin adı olan "Pardus Flowmind with Gemini", gelecekte Google Gemini API entegrasyonu ile daha akıllı özellikler (örneğin, metin açıklamalarından otomatik şema oluşturma, şemaları analiz etme) sunma potansiyeline işaret etmektedir.

**Kullanılan Teknolojiler**:
*   **Frontend**: React, TypeScript
*   **Build Tool**: Vite
*   **Masaüstü Çerçevesi**: Electron
*   **Görselleştirme**: ReactFlow (akış şemaları ve zihin haritaları için)
*   **Diğer**: `html-to-image`, `jspdf`, `lucide-react`
*   **Yapay Zeka Entegrasyonu**: `@google/genai` (gelecekteki entegrasyonlar için)

**Dizin**: `flowmind-pardus/`

---

### 2. Multimodal AI Chatbot Projeleri (Yerel ve Gemini Destekli)

Bu başlık altında, farklı yapay zeka entegrasyonlarına sahip multimodal sohbet robotu projelerimiz bir arada sunulmaktadır. Temel amaç, kullanıcılara metin, ses ve görüntü gibi farklı modalitelerde yapay zeka ile etkileşim kurma imkanı sunmaktır. Bu projeler, yapay zeka destekli sohbet deneyimini hem yerel cihazda çalışabilen açık kaynaklı modellerle hem de Google Gemini API'nin gelişmiş yetenekleriyle sunarak esneklik sağlamaktadır.

#### 2.1. multimodal-ai-chatbot & multimodal-ai-chatbot-AI-backend (Yerel Çalışan Sürüm)

**Açıklama**: Bu sürüm, bulut tabanlı hizmetlere bağımlılığı azaltarak, gizliliği ve erişilebilirliği artıran, çevrimdışı çalışabilen bir yapay zeka deneyimi sunmayı amaçlar. Açık kaynaklı (Hugging Face) modelleri yerel cihazda çalıştırır. `multimodal-ai-chatbot` kullanıcı arayüzünü sağlarken, `multimodal-ai-chatbot-AI-backend` Python tabanlı yapay zeka arka ucunu barındırır.

**Çözdüğü Problem**: Günümüzdeki birçok yapay zeka uygulaması, veri işleme ve model çalıştırma için bulut tabanlı hizmetlere bağımlıdır. Bu durum, kullanıcı gizliliği, veri güvenliği ve sürekli internet bağlantısı gereksinimi gibi sorunlara yol açabilir. Bu proje, yapay zeka modellerini yerel cihazlarda çalıştırarak bu bağımlılıkları ortadan kaldırmayı, gizliliği korumayı ve çevrimdışı çalışma yeteneği sunmayı hedefler.

**Yöntem**: Proje, iki ana bileşenden oluşur: Kullanıcı Arayüzü (Frontend) ve Yapay Zeka Arka Ucu (AI Backend). Frontend, React, TypeScript, Vite ve Electron kullanılarak geliştirilmiştir. AI Backend ise Python ve Jupyter Notebooks (`Pardus.ipynb`, `PardusRun.ipynb`) kullanılarak yerel cihazda açık kaynaklı yapay zeka modellerini yönetir ve çalıştırır.

**Kullanılan Teknolojiler**:
*   **Frontend**: React, TypeScript, Vite, Electron
*   **AI Backend**: Python, Jupyter Notebooks, Hugging Face Transformers (belirtilmiş ancak çıkarılmış), `soundfile`, `Pillow`, `numpy`
*   **Styling**: Tailwind CSS

**Dizinler**: `multimodal-ai-chatbot/`, `multimodal-ai-chatbot-AI-backend/`

#### 2.2. multimodal-ai-chatbot-gemini (Gemini Destekli Sürüm)

**Açıklama**: Bu sürüm, Google Gemini API'sinin gücünden yararlanarak daha gelişmiş ve bulut tabanlı yapay zeka yetenekleri sunar. Metin, ses ve görüntü gibi çok modlu etkileşimleri Gemini'nin gelişmiş modelleriyle gerçekleştirir. Bu proje, Pardus kullanıcıları için işletim sistemiyle bütünleşik çalışan, modern arayüzlü ve aynı anda birden fazla veri türünü işleyebilen gelişmiş bir yapay zeka asistanı olarak konumlandırılmıştır.

**Çözdüğü Problem**: Pardus kullanıcıları için, işletim sistemiyle bütünleşik çalışan, modern arayüzlü ve aynı anda birden fazla veri türünü (metin, ses, görüntü) işleyebilen gelişmiş bir yapay zeka asistanı eksikliği bulunmaktadır. Bu proje, bu boşluğu doldurarak tüm bu yetenekleri tek bir çatı altında toplamayı ve Pardus kullanıcılarına akıcı bir yapay zeka deneyimi sunmayı hedefler.

**Yöntem**: Proje, Electron çerçevesi kullanılarak geliştirilmiş bir çapraz platform masaüstü uygulamasıdır. Kullanıcı arayüzü React ve TypeScript ile bileşen tabanlı bir yaklaşımla oluşturulmuştur. Uygulama, Gemini API'sini kullanarak metin tabanlı yanıtlar, görüntü analizi ve ses tanıma/sentezleme gibi çok modlu yetenekler sunar. Durum yönetimi React Hooks ile sağlanırken, stil için Tailwind CSS kullanılmıştır.

**Kullanılan Teknolojiler**:
*   **Programlama Dilleri**: TypeScript, JavaScript
*   **Masaüstü Çerçevesi**: Electron
*   **Frontend Kütüphanesi**: React
*   **API**: Google Gemini API (`@google/genai`)
*   **Stil**: Tailwind CSS
*   **Derleme ve Geliştirme Aracı**: Vite
*   **Ses İşleme**: Tarayıcının `MediaRecorder` ve `SpeechSynthesis` API'leri

**Dizin**: `multimodal-ai-chatbot-gemini/`

---

### 3. pardus-ai-agent

**Açıklama**: `pardus-ai-agent`, Pardus işletim sistemi üzerinde kullanıcıların doğal dil ile verdiği komutları anlayarak bunları doğrudan sistem üzerinde çalıştırılabilir eylemlere dönüştüren yenilikçi bir yapay zeka ajanıdır.

**Çözdüğü Problem**: Geliştiriciler, sistem yöneticileri ve hatta son kullanıcılar, sık sık tekrar eden veya ezberlenmesi zor olan komutlarla çalışmak zorunda kalır. Görevleri otomatikleştirmek için betikler yazmak zaman alıcı olabilir ve her durum için esnek çözümler sunmayabilir. Bu proje, kullanıcıların "bana bir web sunucusu kur" veya "projedeki tüm testleri çalıştır" gibi basit cümlelerle karmaşık işlemleri gerçekleştirmesine olanak tanıyarak bu problemi çözmeyi hedefler.

**Yöntem**: Proje, kullanıcıdan gelen doğal dil komutlarını alıp bunları çalıştırılabilir Python koduna çevirmek için Google'ın güçlü Gemini 1.5 Flash modelini kullanır. Bir Flask web sunucusu aracılığıyla dış dünya ile iletişim kurar. Gelen istekler bir AI çekirdeği tarafından işlenir ve Gemini API'den Python kodu üretmesi istenir. Üretilen kod, güvenli bir ortamda bir eylem yürütücü tarafından çalıştırılır ve sonuçlar kullanıcıya geri döndürülür.

**Kullanılan Teknolojiler**:
*   **Programlama Dili**: Python 3
*   **Yapay Zeka Modeli**: Google Gemini 1.5 Flash
*   **Web Framework**: Flask (API sunucusu için)
*   **Ana Kütüphaneler**: `google-generativeai`, `Flask`, `Werkzeug`, `Flask-Cors`

**Dizin**: `pardus-ai-agent/`

---

### 4. pardus-dream

**Açıklama**: `pardus-dream`, Pardus kullanıcıları için tasarlanmış, hayal gücünü gerçeğe dönüştüren, yapay zeka destekli bir görsel içerik üretme stüdyosudur. Bu uygulama ile metin tabanlı komutlar (prompt) kullanarak benzersiz görseller yaratabilir, mevcut görsellerden ilham alarak yeni varyasyonlar oluşturabilir ve yaratıcılığınızı ateşleyecek fikirler edinebilirsiniz.

**Çözdüğü Problem**: Yapay zeka tabanlı görsel üretim araçları genellikle web tabanlıdır ve stabil bir internet bağlantısı gerektirir. Ayrıca, bu platformlar işletim sistemiyle entegre çalışmaz ve yerel bir iş akışı sunmaz. `Pardus Dream`, bu boşluğu doldurarak, kullanıcılara doğrudan kendi bilgisayarlarından, daha akıcı ve kişisel bir yaratım süreci sunar.

**Yöntem**: Uygulama, Electron çerçevesi kullanılarak geliştirilmiş bir çapraz platform masaüstü uygulamasıdır. Arayüz React ve Vite ile oluşturulmuş, Tailwind CSS ile stil verilmiştir. Uygulamanın kalbinde Google Gemini API yer alır; `imagen-3.0-generate-002` modeli metinden ve görselden görsel üretimi için kullanılırken, `gemini-2.5-flash` modeli istem geliştirme, görsel analizi ve fikir üretme gibi daha hızlı ve metin odaklı görevler için tercih edilir. Üretilen görseller ve istemler `localStorage` üzerinde kalıcı olarak saklanır.

**Kullanılan Teknolojiler**:
*   **Programlama Dili**: TypeScript
*   **Frontend**: React, Vite
*   **Masaüstü Çerçevesi**: Electron
*   **Styling**: Tailwind CSS, Lucide React
*   **Yapay Zeka API**: Google Gemini API (`@google/genai`)
*   **Veri Kalıcılığı**: `localStorage`

**Dizin**: `pardus-dream/`

---

### 5. pardus-göz-egzersizi-ve-hizli-okuma-programi

**Açıklama**: `pardus-göz-egzersizi-ve-hizli-okuma-programi`, kullanıcıların okuma hızlarını ve anlama becerilerini geliştirmelerine yardımcı olmak, aynı zamanda dijital ekran kullanımından kaynaklanan göz yorgunluğunu azaltmaya yönelik kapsamlı bir masaüstü uygulamasıdır. Modern hızlı okuma tekniklerini ve bilimsel göz egzersizlerini interaktif bir platformda birleştirir.

**Çözdüğü Problem**: Günümüz bilgi çağında, bireyler yoğun bilgi akışıyla karşı karşıyadır ve bu durum, okuma hızının yetersiz kalmasına neden olabilmektedir. Ayrıca, uzun süreli dijital ekran maruziyeti, göz yorgunluğu ve odaklanma güçlüğü gibi göz sağlığı sorunlarına yol açmaktadır. Bu proje, hem okuma verimliliğini artırmayı hem de göz sağlığını korumayı amaçlar.

**Yöntem**: Proje, hızlı okuma ve göz egzersizlerini modüler bir yaklaşımla sunar. Kullanıcılar, yapay zeka tarafından oluşturulan metinlerle okuma pratiği yapabilir, kendi metinlerini kullanabilir veya EPUB e-kitapları okuyabilirler. Görüş alanı genişletme, kelime flaşlama, odak değiştirme ve Schulte Tablosu gibi çeşitli göz egzersizleri sunulur. Uygulama, React, TypeScript, Vite ve Electron kullanılarak geliştirilmiştir. Yapay zeka destekli metin oluşturma için Google Gemini API entegrasyonu bulunmaktadır.

**Kullanılan Teknolojiler**:
*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **Build Tool**: Vite
*   **Desktop Framework**: Electron
*   **EPUB Parsing**: `epubjs`
*   **AI Integration**: `@google/genai` (Google Gemini API)

**Dizin**: `pardus-göz-egzersizi-ve-hizli-okuma-programi/`

---

### 6. pardus-hizli-klavye

**Açıklama**: `pardus-hizli-klavye`, kullanıcıların klavye yazma hızlarını ve doğruluğunu geliştirmelerine yardımcı olmak amacıyla geliştirilmiş bir masaüstü uygulamasıdır. Hızlı ve doğru yazma becerilerini artırarak, dijital ortamda daha verimli olmayı hedefler.

**Çözdüğü Problem**: Dijital çağda klavye kullanım becerileri büyük önem kazanmıştır. Yavaş ve hatalı yazma, verimliliği düşürür ve zaman kaybına yol açar. Bu proje, kullanıcıların bu temel problemi interaktif ve etkili bir şekilde çözmelerine yardımcı olmayı amaçlamaktadır.

**Yöntem**: Proje, kullanıcıların yazma becerilerini geliştirmeleri için çeşitli zorluk seviyelerinde klavye testleri sunar. Kullanıcılar, belirli metinleri yazarak hızlarını (WPM - Words Per Minute) ve doğruluklarını ölçebilirler. Uygulama, Electron, React ve TypeScript kullanılarak modern bir arayüzle tasarlanmıştır. Gelecekte Gemini API'nin dinamik metinler oluşturma veya kişiselleştirilmiş geri bildirimler sağlama gibi özellikler için entegrasyon potansiyeli bulunmaktadır.

**Kullanılan Teknolojiler**:
*   **Masaüstü Çerçevesi**: Electron
*   **Frontend**: React, TypeScript
*   **Build Tool**: Vite
*   **Styling**: HTML/CSS
*   **Yapay Zeka Entegrasyonu**: Gelecekteki entegrasyonlar için Gemini API potansiyeli

**Dizin**: `pardus-hizli-klavye/`

---

### 7. pardus-not-defteri

**Açıklama**: `pardus-not-defteri`, kullanıcıların not alma deneyimini modern yapay zeka (AI) yetenekleriyle birleştiren, zengin özelliklere sahip bir masaüstü not alma uygulamasıdır. Projenin temel amacı, geleneksel not alma işlevselliğini Google Gemini API destekli özelliklerle birleştirerek kullanıcı verimliliğini, yaratıcılığını ve not yönetimi kolaylığını artırmaktır.

**Çözdüğü Problem**: Geleneksel not alma uygulamaları genellikle pasif araçlardır ve kullanıcıların notlarını düzenleme, yeni fikirler üretme veya mevcut bilgileri analiz etme süreçlerinde aktif destek sunmazlar. Bu durum, özellikle yoğun bilgi akışı olan ortamlarda veya yaratıcı süreçlerde kullanıcıların ek araçlara yönelmesine neden olur. `Pardus Not Defteri`, bu eksikliği gidererek not alma sürecini daha akıllı, etkileşimli ve verimli hale getirmeyi hedefler.

**Yöntem**: Uygulama, React ve TypeScript kullanılarak geliştirilmiş, Electron çerçevesi sayesinde platformlar arası uyumluluk sağlayan bir masaüstü uygulamasıdır. Yapay zeka yetenekleri, Google Gemini API'nin güçlü doğal dil işleme ve multimodal yetenekleri entegre edilerek sağlanmıştır. AI sohbet, not içeriği ve başlık önerileri, sesli notların metne çevrilmesi (transkripsiyon) ve özetleme gibi özellikler sunulur. Ses işleme için Web Audio API ve MediaRecorder API kullanılırken, notlar kullanıcının yerel cihazında güvenli bir şekilde depolanır.

**Kullanılan Teknolojiler**:
*   **Programlama Dilleri**: TypeScript, JavaScript
*   **Frontend Çerçevesi**: React
*   **Masaüstü Çerçevesi**: Electron
*   **Build Tool**: Vite
*   **Stil Yönetimi**: Tailwind CSS, PostCSS, Autoprefixer
*   **Yapay Zeka API**: Google Gemini API (`@google/genai`)
*   **Ses İşleme**: Web Audio API, MediaRecorder API, Web Speech API
*   **HTTP İstemcisi**: Axios

**Dizin**: `pardus-not-defteri/`

---

### 8. pardus-ofis-sunum

**Açıklama**: `pardus-ofis-sunum`, kullanıcıların yapay zeka destekli araçlarla hızlı ve etkili bir şekilde profesyonel sunumlar oluşturmasını sağlayan bir masaüstü uygulamasıdır. Proje, sunum hazırlama sürecini otomatize ederek ve yapay zeka tabanlı öneriler sunarak kullanıcı verimliliğini artırmayı hedefler.

**Çözdüğü Problem**: Geleneksel sunum hazırlama süreçleri genellikle zaman alıcı ve zahmetlidir. Kullanıcılar, içerik oluşturma, tasarım seçimi ve düzenleme gibi adımlarda zorluklar yaşayabilirler. Bu proje, bu zorlukları aşarak, özellikle içerik oluşturma ve görselleştirme aşamalarında yapay zeka desteği ile bu süreci kolaylaştırmayı hedefler.

**Yöntem**: Pardus Ofis Sunum, Google Gemini API'nin güçlü yapay zeka yeteneklerini kullanarak sunum oluşturma sürecini dönüştürür. Uygulama, kullanıcıdan alınan konulara göre otomatik olarak sunum taslakları oluşturur, slayt içeriklerini detaylandırır, tasarımları yeniden düzenler ve hatta görseller üretir. Ayrıca, kullanıcılara sunumları üzerinde sohbet tabanlı yardım sunarak interaktif bir deneyim sağlar. Electron framework'ü sayesinde masaüstü uygulaması olarak çalışır.

**Kullanılan Teknolojiler**:
*   **Programlama Dilleri**: TypeScript, JavaScript
*   **Frontend Framework**: React
*   **Masaüstü Uygulama Framework**: Electron
*   **Build Tool**: Vite
*   **Yapay Zeka API**: Google Gemini API (`@google/genai`)
*   **UI Kütüphaneleri**: `lucide-react`, `tailwindcss`
*   **Görüntü İşleme**: `html-to-image`
*   **PDF Oluşturma**: `jspdf`
*   **Dosya Sıkıştırma**: `jszip`

**Dizin**: `pardus-ofis-sunum/`

---

### 9. pardus-piksella

**Açıklama**: `pardus-piksella`, kullanıcıların fotoğraf ve medya kütüphanelerini yapay zeka destekli özelliklerle daha verimli bir şekilde yönetmelerini, organize etmelerini ve anlamlandırmalarını sağlayan bir masaüstü uygulamasıdır. Projenin temel amacı, geleneksel fotoğraf galerisi deneyimini akıllı analiz, otomatik etiketleme, anı oluşturma ve sohbet tabanlı etkileşimlerle zenginleştirmektir.

**Çözdüğü Problem**: Günümüz dijital çağında, kullanıcılar giderek artan sayıda fotoğraf ve video çekmekte, bu da büyük ve düzensiz medya kütüphanelerine yol açmaktadır. Bu durum, belirli bir fotoğrafı bulmayı zorlaştırmakta, değerli anıların gözden kaçmasına neden olmakta ve medya yönetimini sıkıcı bir görev haline getirmektedir. `Pardus Piksella`, bu dağınıklık problemini çözerek kullanıcıların medya içeriklerinden maksimum fayda sağlamasına yardımcı olmayı hedefler.

**Yöntem**: `Pardus Piksella`, bu problemi çözmek için Google Gemini API'nin güçlü yapay zeka yeteneklerini kullanır. Uygulama, görselleri otomatik olarak analiz eder, içeriklerine göre etiketler ve açıklamalar oluşturur. Ayrıca, benzer temalara sahip fotoğrafları gruplayarak "anılar" oluşturur ve kullanıcının medya kütüphanesinden günlük özetler sunar. Kullanıcılar, doğal dil kullanarak yapay zeka asistanıyla sohbet edebilir ve belirli fotoğrafları veya anıları kolayca bulabilirler. Uygulama, yerel depolama (IndexedDB) kullanarak kullanıcı verilerinin gizliliğini ve performansını sağlar.

**Kullanılan Teknolojiler**:
*   **Frontend**: React, Vite, TypeScript
*   **Masaüstü Uygulama Çerçevesi**: Electron
*   **Yapay Zeka Entegrasyonu**: Google Gemini API (`@google/genai`)
*   **Veritabanı**: IndexedDB (`idb` kütüphanesi ile)
*   **UI Bileşenleri**: Lucide React
*   **Stil**: Tailwind CSS

**Dizin**: `pardus-piksella/`

---

### 10. pardusrun-dashboard

**Açıklama**: `pardusrun-dashboard`, Pardus kullanıcıları için tasarlanmış, hızlı başlangıç ve günlük işlemleri kolaylaştıran kapsamlı bir masaüstü uygulamasıdır. Temel amacı, kullanıcıların sık kullandığı bilgilere, araçlara ve kısayollara tek bir merkezi arayüzden erişimini sağlayarak dijital deneyimlerini optimize etmek ve verimliliklerini artırmaktır. Uygulama, kişiselleştirilebilir widget'lar ve yapay zeka destekli özelliklerle zenginleştirilmiş bir kontrol paneli sunar.

**Çözdüğü Problem**: Modern işletim sistemlerinde kullanıcılar, farklı görevleri yerine getirmek veya bilgiye ulaşmak için çeşitli uygulamalar ve web siteleri arasında sürekli geçiş yapmak zorunda kalabilirler. Bu durum, zaman kaybına ve dağınık bir çalışma ortamına yol açabilir. `PardusRun Dashboard`, bu parçalı yapıyı ortadan kaldırarak, hava durumu, haberler, müzik önerileri, oyunlar, günlük içgörüler ve yapay zeka destekli hızlı yanıtlar gibi birçok özelliği tek bir entegre platformda birleştirerek kullanıcıların ihtiyaç duyduğu her şeye anında erişimini sağlar.

**Yöntem**: PardusRun Dashboard, modern web teknolojilerinin gücünü masaüstü uygulaması esnekliğiyle birleştiren hibrit bir yaklaşımla geliştirilmiştir. React ve TypeScript ile dinamik ve etkileşimli bir kullanıcı arayüzü oluşturulmuş, bu arayüz Electron framework'ü sayesinde platformlar arası uyumlu bir masaüstü uygulamasına dönüştürülmüştür. Uygulama, modüler widget mimarisi sayesinde kolayca genişletilebilir ve yeni özellikler eklenebilir. Google Gemini API entegrasyonu ile yapay zeka destekli akıllı özellikler sunulmaktadır. Tailwind CSS gibi utility-first bir CSS framework'ü kullanılarak hızlı ve tutarlı bir tasarım sağlanmıştır.

**Kullanılan Teknolojiler**:
*   **Programlama Dilleri**: TypeScript, JavaScript
*   **Frontend Framework**: React
*   **Masaüstü Uygulama Framework**: Electron
*   **Build Tool**: Vite
*   **Yapay Zeka API**: Google Gemini API (`@google/genai`)
*   **İkon Kütüphanesi**: Lucide React
*   **Styling**: Tailwind CSS

**Dizin**: `pardusrun-dashboard/`

---

## Diğer Projeler: Araştırma ve Yardımcı Uygulamalar

Bu bölümde, ana projelerimizi destekleyen veya belirli araştırma alanlarına odaklanan diğer projelerimiz yer almaktadır. Bu projeler, doğrudan son kullanıcıya yönelik olmasa da, genel geliştirme ekosistemimize katkıda bulunur veya belirli teknik zorluklara çözüm sunar.

### 1. pardus-linux-shell-aracı

**Açıklama**: `pardus-linux-shell-aracı`, Pardus işletim sistemi için geliştirilmiş, Electron tabanlı bir kabuk aracıdır. Bu araç, kullanıcıların komut satırı işlemlerini daha akıllı ve etkileşimli bir şekilde gerçekleştirmelerine olanak tanır.

**Çözdüğü Problem**: Geleneksel komut satırı arayüzleri, özellikle yeni kullanıcılar için karmaşık ve göz korkutucu olabilir. Komutları hatırlamak, doğru parametreleri kullanmak ve çıktıları yorumlamak zaman alıcıdır. Bu proje, yapay zeka desteği ile bu süreci basitleştirerek, kullanıcıların doğal dilde komutlar vermesine ve daha sezgisel bir deneyim yaşamasına olanak tanır.

**Yöntem**: Uygulama, React ve Vite kullanılarak oluşturulmuş bir arayüze sahiptir ve Electron ile masaüstü uygulaması olarak çalışır. Google Gemini API entegrasyonu sayesinde, kullanıcı girdilerini işleyerek ilgili Linux komutlarını önerebilir, komut çıktılarını yorumlayabilir veya karmaşık görevleri otomatikleştirebilir. `axios` ve `socket.io-client` gibi kütüphaneler, potansiyel olarak bir arka uç servisi ile iletişim kurarak daha gelişmiş işlevsellik sağlamak için kullanılmıştır.

**Kullanılan Teknolojiler**:
*   **Frontend**: React, TypeScript
*   **Build Tool**: Vite
*   **Masaüstü Çerçevesi**: Electron
*   **Yapay Zeka Entegrasyonu**: `@google/genai` (Google Gemini API)
*   **İletişim**: `axios`, `socket.io-client`
*   **Styling**: Tailwind CSS

**Dizin**: `pardus-linux-shell-aracı/`

---

### 2. pardus-deepseek

**Açıklama**: `pardus-deepseek` dizini, DeepSeek ile ilgili yapay zeka modeli eğitimi, deneyleri ve veri birleştirme çalışmalarını içeren Jupyter Notebook dosyalarını barındırmaktadır. Bu proje, muhtemelen farklı yapay zeka modelleri üzerinde derinlemesine araştırmalar yapmayı veya mevcut modelleri Pardus ekosistemi için optimize etmeyi amaçlamaktadır.

**Çözdüğü Problem**: Yapay zeka modellerinin geliştirilmesi ve optimize edilmesi, genellikle karmaşık veri işleme, model eğitimi ve değerlendirme süreçleri gerektirir. Bu süreçler, etkileşimli ve tekrarlanabilir bir ortamda yürütülmelidir. `pardus-deepseek`, bu tür araştırma ve geliştirme faaliyetleri için bir platform sunarak, model performansını artırma ve yeni yapay zeka yetenekleri keşfetme potansiyeli taşır.

**Yöntem**: Proje, Jupyter Notebook'lar aracılığıyla veri analizi, model tanımlama, eğitim döngüleri ve sonuçların görselleştirilmesi gibi adımları içerir. `DeepSeekWeb.ipynb`, `ModelEgitimDeepSeek.ipynb` ve `VerBirlesitm9re1.ipynb` gibi dosyalar, projenin odaklandığı alanları (web verisi işleme, model eğitimi ve veri birleştirme) göstermektedir.

**Kullanılan Teknolojiler**:
*   **Programlama Dili**: Python
*   **Geliştirme Ortamı**: Jupyter Notebook
*   **Yapay Zeka Kütüphaneleri**: Muhtemelen DeepSeek modelleri ve ilgili kütüphaneler (detaylı bilgi için notebook içerikleri incelenmelidir)
*   **Veri İşleme**: Pandas, NumPy gibi kütüphaneler

**Dizin**: `pardus-deepseek/`
