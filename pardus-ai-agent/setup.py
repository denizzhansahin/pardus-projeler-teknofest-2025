# setup.py

from setuptools import setup, find_packages

# README dosyasını okuyarak uzun açıklama oluşturma
try:
    with open("README.md", "r", encoding="utf-8") as fh:
        long_description = fh.read()
except FileNotFoundError:
    long_description = "Pardus için geliştirilmiş, Gemini destekli, akıllı bir komut satırı asistanı."

setup(
    # --- Temel Paket Bilgileri ---
    name="pardus-ai-agent",
    version="1.0.1",
    author="[Adınız Soyadınız]",
    author_email="[email@adresiniz.com]",
    description="Pardus için geliştirilmiş, Gemini destekli, akıllı bir komut satırı asistanı.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="[Projenizin GitHub Adresi (isteğe bağlı)]",

    # --- Paket Yapılandırması ---
    # Projedeki tüm paketleri (agent klasörü gibi) otomatik olarak bulur.
    packages=find_packages(),

    # --- Bağımlılıklar ve Uyumluluk ---
    # Kurulum sırasında otomatik olarak yüklenecek kütüphaneler.
    install_requires=[
        "google-generativeai",
        "colorama",
        "gitpython"
    ],
    # Gerekli minimum Python sürümü.
    python_requires='>=3.8',

    # --- Komut Satırı Giriş Noktası ---
    # 'pardus-ai-agent' komutunu oluşturur ve agent.main:main fonksiyonuna bağlar.
    entry_points={
        'console_scripts': [
            'pardus-ai-agent=agent.main:main',
        ],
    },

    # --- Ek Meta Veriler (Sınıflandırıcılar) ---
    # Projeyi PyPI gibi platformlarda kategorize etmek için kullanılır.
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: MIT License",
        "Operating System :: POSIX :: Linux",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: System :: Shells",
        "Topic :: System :: System Administration",
    ],
)