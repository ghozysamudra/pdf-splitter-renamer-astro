import React, { useState, useEffect, useMemo } from 'react';
import type { CsvRow, ProcessingStatus, FileData, NamingConfig } from '../types';
import { parseCsv, splitPdf, generateFileName } from '../services/pdfService';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

import Header from './pdf-splitter/Header';
import PdfInput from './pdf-splitter/PdfInput';
import NamingConfigPanel from './pdf-splitter/NamingConfigPanel';
import ActionControls from './pdf-splitter/ActionControls';
import FaqSection from './pdf-splitter/FaqSection';
import Footer from './pdf-splitter/Footer';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

const PdfSplitter: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<FileData | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<FileData | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);

  const [namingConfig, setNamingConfig] = useState<NamingConfig>({
    strategy: 'default',
    customBase: '',
    manualNames: '',
    startNumber: 1,
    padding: 2,
    numberLocation: 'suffix',
    csvColumn: '',
    csvHasHeader: true,
    addNumberToCsv: false,
    addNumberToManual: true
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [resultZip, setResultZip] = useState<Blob | null>(null);

  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);

  const generatePreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfPageCount(pdfDoc.getPageCount());

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        setPdfPreviewUrl(canvas.toDataURL());
      }
    } catch (err) {
      console.error("Failed to generate preview", err);
    }
  };

  const handlePdfUpload = (file: File | undefined) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile({ name: file.name, file });
      setResultZip(null);
      generatePreview(file);
    }
  };

  const loadCsv = async (file: File, hasHeader: boolean) => {
    try {
      const { data, columns } = await parseCsv(file, hasHeader);
      setCsvData(data);
      setCsvColumns(columns);
      setNamingConfig(prev => ({
        ...prev,
        csvColumn: columns.length > 0 ? columns[0] : ''
      }));
      setResultZip(null);
    } catch (err) {
      alert("Failed to parse CSV file. Please ensure it is valid.");
    }
  };

  const handleCsvUpload = async (file: File | undefined) => {
    if (file) {
      setCsvFile({ name: file.name, file });
      await loadCsv(file, namingConfig.csvHasHeader);
    }
  };

  useEffect(() => {
    if (csvFile) {
      loadCsv(csvFile.file, namingConfig.csvHasHeader);
    }
  }, [namingConfig.csvHasHeader]);

  const handleProcess = async () => {
    if (!pdfFile) return;
    if (namingConfig.strategy === 'csv' && !csvFile) return;

    setIsProcessing(true);
    setResultZip(null);
    try {
      const zipBlob = await splitPdf(
        pdfFile.file,
        csvData,
        namingConfig,
        (progress) => setStatus(progress)
      );
      setResultZip(zipBlob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = `split_pdfs_${new Date().getTime()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPdfFile(null);
    setPdfPageCount(0);
    setPdfPreviewUrl(null);
    setCsvFile(null);
    setCsvData([]);
    setCsvColumns([]);
    setNamingConfig({
      strategy: 'default',
      customBase: '',
      manualNames: '',
      startNumber: 1,
      padding: 2,
      numberLocation: 'suffix',
      csvColumn: '',
      csvHasHeader: true,
      addNumberToCsv: false,
      addNumberToManual: true
    });
    setIsProcessing(false);
    setStatus(null);
    setResultZip(null);
  };

  const previews = useMemo(() => {
    if (!pdfFile) return [];
    return [0, 1, 2].map(idx => ({
      index: idx + 1,
      name: generateFileName(idx, namingConfig, pdfFile.name, csvData) + '.pdf'
    }));
  }, [pdfFile, namingConfig, csvData]);

  const isNumberingEnabled = useMemo(() => {
    if (namingConfig.strategy === 'csv') return namingConfig.addNumberToCsv;
    if (namingConfig.strategy === 'manual') return namingConfig.addNumberToManual;
    return true;
  }, [namingConfig]);

  const handleDragOver = (e: React.DragEvent, setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'pdf' | 'csv', setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (type === 'pdf') handlePdfUpload(file);
    else handleCsvUpload(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
        <div className="lg:col-span-4">
          <PdfInput
            pdfFile={pdfFile}
            pdfPageCount={pdfPageCount}
            pdfPreviewUrl={pdfPreviewUrl}
            isDraggingPdf={isDraggingPdf}
            onPdfUpload={handlePdfUpload}
            onRemovePdf={() => setPdfFile(null)}
            onDragOver={(e) => handleDragOver(e, setIsDraggingPdf)}
            onDragLeave={(e) => handleDragLeave(e, setIsDraggingPdf)}
            onDrop={(e) => handleDrop(e, 'pdf', setIsDraggingPdf)}
          />
        </div>

        <div className="lg:col-span-8 space-y-8">
          <NamingConfigPanel
            namingConfig={namingConfig}
            setNamingConfig={setNamingConfig}
            csvFile={csvFile}
            csvColumns={csvColumns}
            isDraggingCsv={isDraggingCsv}
            isNumberingEnabled={isNumberingEnabled}
            onCsvUpload={handleCsvUpload}
            onRemoveCsv={() => setCsvFile(null)}
            onDragOver={(e) => handleDragOver(e, setIsDraggingCsv)}
            onDragLeave={(e) => handleDragLeave(e, setIsDraggingCsv)}
            onDrop={(e) => handleDrop(e, 'csv', setIsDraggingCsv)}
            pdfFile={pdfFile}
            pdfPageCount={pdfPageCount}
            previews={previews}
          />
        </div>
      </div>

      <ActionControls
        isProcessing={isProcessing}
        status={status}
        resultZip={resultZip}
        onProcess={handleProcess}
        onDownload={downloadResult}
        onReset={reset}
        canProcess={!!pdfFile && (namingConfig.strategy !== 'csv' || !!csvFile)}
      />

      <FaqSection />
      <Footer />
    </div>
  );
};

export default PdfSplitter;
