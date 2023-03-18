const fs=require('fs');
const readline = require('readline');
function searchFile(searchTerm, filename) {
    return new Promise((resolve, reject) => {
      const matchingWords = [];

      const readStream = fs.createReadStream(filename, { encoding: "utf-8" });
      const lineReader = readline.createInterface({ input: readStream });

      lineReader.on("line", (line) => {
        const sentences = line.split(/[.!?]/g); // split into sentences
        for (let sentence of sentences) {
          const words = sentence.split(/\s+/g); // split into words
          for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/'s?\b/gi, '').replace(/\W+$/g, '').replace(/\n/g, '');
            if (word.toLowerCase() === searchTerm.toLowerCase()) {
              let index = words.indexOf(word);
              const startIndex = Math.max(0, index - 3);
              const endIndex = Math.min(words.length - 1, index + 3);
              const contextWords = words.slice(startIndex, endIndex + 1);
              const context = contextWords.join(' ');
              matchingWords.push(context);
            }
          }
        }
      });

      lineReader.on("close", () => {
        resolve(matchingWords);
      });

      lineReader.on("error", (err) => {
        reject(err);
      });
    });
  }
  module.exports = searchFile;