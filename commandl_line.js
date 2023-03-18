const readline = require('readline');
const { Worker } = require('worker_threads');
const fs=require('fs');
const path=require('path');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function searchFileForWord(word, workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData });
    worker.on('message', (message) => {
      if (message.type === 'matches') {
        resolve(message.matches);
      }
    });
    worker.on('error',(err) => {
        reject(err);
    });
    worker.on('exit', (code) => {
     
        reject(new Error(`Worker stopped with exit code ${code}`));
      
      
    });
    worker.postMessage(word);
  });
}

async function promptUser(filepath) {
  try {
    const answer = await new Promise((resolve) => {
      rl.question('Enter a search term (or "letsquit" to quit): ', resolve);
    });
    if (answer === 'letsquit') {
      rl.close();
      process.exit(0);
    }
    const matches = await searchFileForWord(answer, { filePath: filepath});
    if (matches.length === 0) {
      console.log(`No matches found for "${answer}"`);
    } else {
      console.log(`Found ${matches.length} matches for "${answer}":`);
      console.log(matches.join('\n'));
    }
  } catch (err) {
    console.error(err);
  }
  promptUser(filepath);
}
function askForFIle(attempts = 3) {
  return new Promise((resolve, reject) => {
    rl.question('Enter a file name to search: ', (filename) => {
      const filePath = path.join(__dirname, 'uploads', filename);
    
      // check if the requested file exists in the uploads directory
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File "${filename}" does not exist in the uploads directory. Please Upload the file using /upload endpoint`);
          if (attempts > 0) {
            askForFIle(attempts - 1).then(resolve).catch(reject); // recursively call askForFIle
          } else {
            reject('Too many invalid attempts');
          }
        } else {
          resolve(filename);
        }
      });
    });
  });
}

askForFIle().then((filePath) => {
promptUser(filePath);
}).catch((err) => {
  console.log('Exiting Too Many Invalid Attempts');
  process.exit(1);
});
