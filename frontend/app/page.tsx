'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CSVImporter() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Parse CSV locally instantly for previewing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(Object.keys(results.data[0] || {}));
        setCsvData(results.data);
        setResult(null); 
      },
    });
  };

  // Send previewed data to backend for AI mapping
  // Send previewed data to backend for AI mapping
  const handleConfirmImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/api/import-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: JSON.stringify(csvData) }),
      });
      
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        setResult(resData);
      } else {
        alert(`Server Error: ${resData.error || 'Unknown error occurred'}\nDetails: ${resData.details || ''}`);
      }
    } catch (err: any) {
      alert(`Network Error: Cannot connect to backend server. Make sure it is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">GrowEasy AI CSV Importer</h1>
          <p className="text-slate-500 text-sm">Upload any layout spreadsheet to smartly map leads directly into your CRM.</p>
        </header>

        {/* Step 1: Upload Layout */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:bg-slate-50 transition">
            <Upload className="h-10 w-10 text-emerald-500 mb-2" />
            <span className="text-sm font-semibold text-slate-700">Drop your CSV file here</span>
            <span className="text-xs text-slate-400 mt-1">or click to browse files (max 5MB)</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Step 2 & 3: Preview and Confirmation Action */}
        {csvData.length > 0 && !result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
              <span className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4"/> Raw Data Preview ({csvData.length} rows)
              </span>
              <button 
                onClick={handleConfirmImport} 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                {loading ? 'AI Processing Batches...' : 'Confirm & Run AI Import'}
              </button>
            </div>
            
            <div className="overflow-auto max-h-72">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    {headers.map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csvData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {headers.map(h => <td key={h} className="p-3 truncate max-w-xs">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Display Output from AI */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">Successfully Imported</p>
                <p className="text-2xl font-bold text-emerald-900">{result.summary.totalImported}</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">Skipped (No Contact Info)</p>
                <p className="text-2xl font-bold text-amber-900">{result.summary.totalSkipped}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-900 text-white font-semibold text-sm">Processed GrowEasy CRM Format Output</div>
              <div className="overflow-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 sticky top-0 border-b text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.data.map((lead: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{lead.name || 'N/A'}</td>
                        <td className="p-3">{lead.email || '—'}</td>
                        <td className="p-3">{lead.country_code} {lead.mobile_without_country_code || '—'}</td>
                        <td className="p-3">
  <span className="inline-block whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{lead.crm_status}</span>
</td>
                        <td className="p-3 text-slate-500">{lead.data_source || '—'}</td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">{lead.crm_note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}