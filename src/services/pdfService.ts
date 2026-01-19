
import { PDFDocument } from 'pdf-lib';
import Papa from 'papaparse';
import JSZip from 'jszip';
import type { CsvRow, ProcessingStatus, NamingConfig } from '../types';

export const parseCsv = (file: File, hasHeader: boolean): Promise<{ data: CsvRow[], columns: string[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: hasHeader,
      skipEmptyLines: true,
      complete: (results) => {
        let columns: string[] = [];
        if (hasHeader) {
          columns = results.meta.fields || [];
        } else {
          const maxLength = Math.max(...results.data.map((row: any) => row.length));
          columns = Array.from({ length: maxLength }, (_, i) => i.toString());
        }

        const normalizedData = hasHeader ? results.data : results.data.map((row: any) => {
          const obj: CsvRow = {};
          row.forEach((val: any, idx: number) => {
            obj[idx.toString()] = val;
          });
          return obj;
        });

        resolve({
          data: normalizedData as CsvRow[],
          columns
        });
      },
      error: (error) => reject(error)
    });
  });
};

export const generateFileName = (
  index: number,
  config: NamingConfig,
  sourceName: string,
  csvData: CsvRow[]
): string => {
  const cleanSource = sourceName.replace(/\.[^/.]+$/, "");
  const num = (config.startNumber + index).toString().padStart(config.padding, '0');

  let base = '';
  let includeNumber = true;

  switch (config.strategy) {
    case 'csv':
      if (config.csvColumn && csvData[index] && csvData[index][config.csvColumn]) {
        base = csvData[index][config.csvColumn].trim();
      } else {
        base = `Page_${index + 1}`;
      }
      includeNumber = config.addNumberToCsv;
      break;
    case 'manual':
      const lines = (config.manualNames || '').split('\n').filter(l => l.trim().length > 0);
      if (lines[index]) {
        base = lines[index].trim();
      } else {
        base = `Page_${index + 1}`;
      }
      includeNumber = config.addNumberToManual;
      break;
    case 'custom':
      base = config.customBase || cleanSource;
      includeNumber = true;
      break;
    default:
      base = cleanSource;
      includeNumber = true;
      break;
  }

  let finalName = base;
  if (includeNumber) {
    if (config.numberLocation === 'prefix') {
      finalName = `${num}_${base}`;
    } else {
      finalName = `${base}_${num}`;
    }
  }

  return finalName.replace(/[/\\?%*:|"<>]/g, '-');
};

export const splitPdf = async (
  pdfFile: File,
  csvData: CsvRow[],
  namingConfig: NamingConfig,
  onProgress: (status: ProcessingStatus) => void
): Promise<Blob> => {
  const log: string[] = [];
  const addLog = (msg: string) => {
    log.push(msg);
    if (log.length > 10) log.shift();
  };

  try {
    addLog(`Loading PDF: ${pdfFile.name}`);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const pageCount = sourcePdf.getPageCount();
    const zip = new JSZip();

    onProgress({
      total: pageCount,
      current: 0,
      message: `Analyzing ${pageCount} pages...`,
      isComplete: false,
      log: [...log]
    });

    for (let i = 0; i < pageCount; i++) {
      const fileName = generateFileName(i, namingConfig, pdfFile.name, csvData);
      addLog(`Extracted: ${fileName}.pdf`);

      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      zip.file(`${fileName}.pdf`, pdfBytes);

      onProgress({
        total: pageCount,
        current: i + 1,
        message: `Processing page ${i + 1}/${pageCount}`,
        isComplete: false,
        log: [...log]
      });
    }

    addLog(`Compiling ZIP archive...`);
    onProgress({
      total: pageCount,
      current: pageCount,
      message: 'Generating ZIP archive...',
      isComplete: false,
      log: [...log]
    });

    const content = await zip.generateAsync({ type: 'blob' });
    addLog(`Successfully generated ZIP.`);

    onProgress({
      total: pageCount,
      current: pageCount,
      message: 'Finished!',
      isComplete: true,
      log: [...log]
    });

    return content;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
    onProgress({
      total: 0,
      current: 0,
      message: 'Error occurred',
      isComplete: false,
      error: errorMsg,
      log: [...log, `ERROR: ${errorMsg}`]
    });
    throw error;
  }
};
