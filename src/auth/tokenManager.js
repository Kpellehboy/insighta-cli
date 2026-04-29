const fs = require('fs');
const path = require('path');
const os = require('os');

const CREDENTIALS_PATH = path.join(os.homedir(), '.insighta', 'credentials.json');

function ensureDir() {
  const dir = path.dirname(CREDENTIALS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveTokens(accessToken, refreshToken) {
  ensureDir();
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify({ accessToken, refreshToken }, null, 2));
}

function loadTokens() {
  try {
    const data = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function clearTokens() {
  if (fs.existsSync(CREDENTIALS_PATH)) fs.unlinkSync(CREDENTIALS_PATH);
}

module.exports = { saveTokens, loadTokens, clearTokens };