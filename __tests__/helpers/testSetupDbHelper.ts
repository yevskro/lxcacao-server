import { exec } from 'child_process';

export default (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('yarn setup-testdb', (error, _, stderr) => {
      if (error) reject(new Error(`error: ${error}`));
      // eslint-disable-next-line no-console
      if (stderr) console.log('stderr', stderr);
      resolve(true);
    });
  });
};
