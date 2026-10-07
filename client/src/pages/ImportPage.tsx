import React, { useState, useRef } from 'react';
import { Link } from '../lib/router';
import apiService from '../services/api';
import type { ImportStats } from '../types';
import { AppShell } from '../components';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
  Table,
} from 'lucide-react';

export const ImportPage: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Please select a valid .csv file.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Only .csv files are supported.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const executeImport = async () => {
    if (!selectedFile) return;

    try {
      setImporting(true);
      setErrorMessage(null);
      const res = await apiService.importCsv(selectedFile);
      setImportStats(res.stats);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import CSV file');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportStats(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AppShell
      title="Import Leads"
      subtitle="Upload SaaSquatch-enriched CSV data into your intelligence workspace."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* If import is NOT yet complete */}
        {!importStats ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
            <div className="text-center max-w-md mx-auto mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Import your leads</h2>
              <p className="text-sm text-slate-500">
                Upload a CSV containing enriched lead data. Unmapped columns will be safely preserved in raw data.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />

              {importing ? (
                <div className="py-6 flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                  <h3 className="text-base font-semibold text-slate-900">Importing leads...</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Normalizing fields and preserving custom metadata.
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedFile.name}</h3>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={executeImport}
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Start Import
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Choose Different File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Drag and drop your CSV file here, or
                  </p>
                  <label
                    htmlFor="csv-file-input"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg border border-indigo-200 transition-colors cursor-pointer mt-2"
                  >
                    Choose CSV File
                  </label>
                  <span className="text-xs text-slate-400 mt-3">
                    Supports standard SaaSquatch column formats (.csv)
                  </span>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Expected format context */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" />
                <span>Expected SaaSquatch Fields</span>
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                The ingestion engine automatically maps common column aliases for:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800 block">Company Info</span>
                  <span>Name, Industry, Website, Location</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800 block">Contact Info</span>
                  <span>Decision Maker, Title, Email, Phone</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800 block">Signals Data</span>
                  <span>Open Positions, Growth, Technology</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Import Results Card */
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Import Complete</h2>
                <p className="text-xs text-slate-500">
                  Your CSV file has been processed and leads are now available in your workspace.
                </p>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-xs font-medium text-slate-500 block mb-1">Total Rows</span>
                <span className="text-xl font-bold text-slate-900">{importStats.total_rows}</span>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200 text-center">
                <span className="text-xs font-medium text-emerald-800 block mb-1">Imported</span>
                <span className="text-xl font-bold text-emerald-900">{importStats.imported}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-xs font-medium text-slate-500 block mb-1">Skipped</span>
                <span className="text-xl font-bold text-slate-700">{importStats.skipped}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-xs font-medium text-slate-500 block mb-1">Errors</span>
                <span
                  className={`text-xl font-bold ${
                    importStats.errors.length > 0 ? 'text-rose-700' : 'text-slate-700'
                  }`}
                >
                  {importStats.errors.length}
                </span>
              </div>
            </div>

            {/* Error rows breakdown if any */}
            {importStats.errors.length > 0 && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                <h4 className="font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Row Validation Errors</span>
                </h4>
                <ul className="space-y-1.5 text-rose-800 max-h-40 overflow-y-auto">
                  {importStats.errors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="font-semibold">Row {err.row}:</span>
                      <span>{err.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Import Another File</span>
              </button>

              <Link
                to="/leads"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors"
              >
                <span>View Leads Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ImportPage;
