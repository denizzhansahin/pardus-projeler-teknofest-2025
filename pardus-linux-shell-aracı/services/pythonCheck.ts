import { exec } from 'child_process';

export function checkPythonAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
