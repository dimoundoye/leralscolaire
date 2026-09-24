// Lecture et écriture de fichiers Excel (.xlsx) et CSV avec exceljs
const ExcelJS = require('exceljs');
const path = require('path');

// Valeur exploitable d'une cellule (texte enrichi, formule, lien, date...)
function cellValue(value) {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('');
    if ('result' in value) return cellValue(value.result);
    if ('text' in value) return value.text;
    return undefined;
  }
  return value;
}

/**
 * Lit la première feuille d'un fichier .xlsx ou .csv.
 * La première ligne donne les noms de colonnes ; chaque ligne suivante devient un objet.
 * @param {string} filePath - chemin du fichier sur le disque
 * @param {string} originalName - nom d'origine (pour distinguer CSV et XLSX)
 */
async function readRows(filePath, originalName = '') {
  const workbook = new ExcelJS.Workbook();
  const isCsv = path.extname(originalName).toLowerCase() === '.csv';
  const sheet = isCsv ? await workbook.csv.readFile(filePath) : (await workbook.xlsx.readFile(filePath)).worksheets[0];
  if (!sheet) return [];

  const headers = [];
  sheet.getRow(1).eachCell((cell, col) => {
    headers[col] = String(cellValue(cell.value) ?? '').trim();
  });

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const item = {};
    row.eachCell((cell, col) => {
      const key = headers[col];
      const value = cellValue(cell.value);
      if (key && value !== undefined && value !== '') item[key] = value;
    });
    if (Object.keys(item).length > 0) rows.push(item);
  });
  return rows;
}

/**
 * Construit un classeur .xlsx à partir d'une liste d'objets (clés = en-têtes).
 * @returns {Promise<Buffer>}
 */
async function rowsToXlsxBuffer(rows, sheetName = 'Feuille1') {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  sheet.columns = headers.map((header) => ({ header, key: header, width: Math.max(12, header.length + 2) }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));
  return workbook.xlsx.writeBuffer();
}

module.exports = { readRows, rowsToXlsxBuffer };
