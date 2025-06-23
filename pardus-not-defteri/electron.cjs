// electron.cjs
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const url = require('url');

// NODE_ENV yerine app.isPackaged kullanalım (daha güvenilir)
// const isDev = process.env.NODE_ENV !== 'production'; // Bu satırı kaldırın veya yorumlayın

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Güvenlik için true bırakın
      sandbox: false,    // Gerekirse false (medya erişimi için)
      // enableRemoteModule: false, // Gerekirse ekleyin
      // allowRunningInsecureContent: false, // Gerekirse ekleyin
      // devTools: true, // Geliştirme için
      // Diğer ayarlar...
    },
  });

  // Uygulamanın paketlenmiş olup olmadığını kontrol et
  if (!app.isPackaged) {
    // Geliştirme modu (paketlenmemiş): Vite dev sunucusunu yükle
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Geliştirme araçlarını aç
  } else {
    // Production modu (paketlenmiş): Build edilmiş HTML dosyasını yükle
    const prodPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Electron production index.html path:', prodPath);
    mainWindow.loadURL(
      url.format({
        pathname: prodPath, // Doğru yolu kontrol edin
        protocol: 'file:',
        slashes: true,
      })
    );
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load:', validatedURL, errorDescription);
    });
    // Production build'ında hata ayıklamak için geçici olarak DevTools'u açabilirsiniz:
    //mainWindow.webContents.openDevTools();
  }
}

// Electron hazır olduğunda pencereyi oluştur.
app.whenReady().then(() => {
  createWindow();

  // Mikrofon ve medya izinlerini otomatik olarak ver
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      // Kamera ve mikrofon izinlerini otomatik olarak ver
      callback(true);
    } else {
      callback(false);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});