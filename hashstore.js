const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'hashdata.json');

// Ensure file exists and has valid JSON content
if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8').trim() === '') {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

function readHashData() {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  return content ? JSON.parse(content) : [];
}

function saveHash(slicedId) {
  const data = readHashData();
  if (!data.includes(slicedId)) {
    data.push(slicedId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

function getAllHashes() {
  return readHashData();
}

module.exports = { saveHash, getAllHashes };
