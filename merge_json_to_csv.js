const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const inputFolder = './coming-game-data';
const outputFile = './combined_games.csv';

function normalizeReleaseDate(dateStr) {
  const monthMap = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  const fullDate = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3}),\s+(\d{4})$/);
  if (fullDate) {
    const [_, day, month, year] = fullDate;
    return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
  }

  const monthYear = dateStr.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (monthYear) {
    const [_, monthLong, year] = monthYear;
    return `${year}-${monthMap[monthLong.slice(0, 3)]}-01`;
  }

  const quarter = dateStr.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarter) {
    const [_, q, year] = quarter;
    const quarterMonth = { '1': '01', '2': '04', '3': '07', '4': '10' }[q];
    return `${year}-${quarterMonth}-01`;
  }

  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  return null;
}

async function convertJsonFilesToCSV() {
  const allFiles = fs.readdirSync(inputFolder).filter(file => file.endsWith('.json'));
  const allData = [];

  for (const file of allFiles) {
    const filePath = path.join(inputFolder, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    jsonData.forEach(entry => {
      const normalized = normalizeReleaseDate(entry.release_date || '');
      const timestamp = normalized ? new Date(normalized).getTime() : null;

      allData.push({
        ...entry,
        normalized_release_date: normalized,
        release_date_timestamp: timestamp
      });
    });
  }

  allData.sort((a, b) => a.release_date_timestamp - b.release_date_timestamp);

  const csv = parse(allData);
  fs.writeFileSync(outputFile, csv, 'utf-8');
  console.log(`✅ CSV saved to ${outputFile}`);
}

convertJsonFilesToCSV().catch(console.error);
