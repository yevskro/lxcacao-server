import { exec } from 'child_process';

export default (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('yarn setup-testdb', (error, _, stderr) => {
      if (error || stderr) {
        console.log(error);
        reject(new Error(`error: ${error} stderr: ${stderr}`));
      }
      return resolve(true);
    });
  });
};
