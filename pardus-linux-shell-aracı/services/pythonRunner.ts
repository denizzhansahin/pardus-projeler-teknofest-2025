// pythonRunner.ts
// Electron ortamında veya Node.js backend ile AI'dan gelen Python kodunu çalıştırmak için
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export function runPythonCode(code: string): Promise<{stdout: string, stderr: string}> {
  return new Promise((resolve, reject) => {
    // Geçici bir dosya oluştur
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `pardus_ai_code_${Date.now()}.py`);
    fs.writeFileSync(filePath, code, 'utf8');
    // python3 ile çalıştır
    exec(`python3 "${filePath}"`, { timeout: 60_000 }, (error, stdout, stderr) => {
      // Dosyayı sil
      fs.unlinkSync(filePath);
      if (error) {
        resolve({ stdout, stderr: stderr || error.message });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
