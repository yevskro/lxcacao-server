import { exec } from 'child_process';

export default (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('yarn setup-testdb', (error) => {
      if (error) reject(new Error(`error: ${error}`));
      resolve(true);
    });
  });
};
