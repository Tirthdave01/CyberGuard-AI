import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

export const readData = (collection) => {
  try {
    const file = getFilePath(collection);
    if (!fs.existsSync(file)) {
      writeData(collection, []);
      return [];
    }
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
};

export const writeData = (collection, data) => {
  try {
    const file = getFilePath(collection);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${collection}:`, error);
    return false;
  }
};
