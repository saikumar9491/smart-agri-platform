import { useState } from 'react';
import { Bug, Upload, Loader2, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';

export default function DiseaseML() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset previous results
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5000/api/disease/detect', {
        method: 'POST',
        body: formData, // fetch will automatically set the correct multipart/form-data boundary
      });
      const data = await response.json();
      
      if (data.success) {
         setResult(data.data);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Bug className="h-8 w-8 text-rose-500" />
          Plant Disease Detection
        </h1>
        <p className="mt-2 text-slate-500">
          Upload a photo of a sick plant leaf and our AI will detect the disease and provide treatment steps.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload Image</h2>
          
          <div className="flex-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 group transition-colors hover:border-green-400 hover:bg-green-50/50">
            {previewUrl ? (
               <img src={previewUrl} alt="Preview" className="w-full h-full object-contain z-10" />
            ) : (
               <div className="text-center">
                 <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-green-500 transition-colors mb-3" />
                 <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                 <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
               </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-slate-900"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing via AI Model...
              </>
            ) : (
              <>
                <FlaskConical className="h-5 w-5" />
                Run Diagnostics
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Diagnostic Report</h2>
          
          {!result && !loading && (
             <div className="flex h-64 flex-col items-center justify-center text-center">
               <div className="mb-4 rounded-full bg-slate-100 p-4">
                 <FlaskConical className="h-8 w-8 text-slate-400" />
               </div>
               <p className="text-sm text-slate-500">
                 Awaiting image upload for analysis.
               </p>
             </div>
          )}

          {loading && (
             <div className="space-y-6">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-rose-400 animate-spin" />
                  </div>
                  <div>
                    <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="animate-pulse space-y-3 pt-4 border-t border-slate-100">
                   <div className="h-4 w-full bg-slate-200 rounded"></div>
                   <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                   <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
                </div>
             </div>
          )}

          {result && !loading && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
                 <div className="mt-1">
                   <AlertTriangle className="h-6 w-6 text-rose-500" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-rose-900">
                     {result.detectedDisease} 
                     <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                       {(result.confidenceScore * 100).toFixed(1)}% Match
                     </span>
                   </h3>
                   <p className="text-sm font-medium text-rose-700/80 mt-1">Immediate action recommended.</p>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                       <CheckCircle2 className="h-4 w-4 text-green-500" /> Treatment Plan
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       {result.treatmentSuggestion}
                    </p>
                 </div>

                 <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                       <FlaskConical className="h-4 w-4 text-blue-500" /> Recommended Pesticide
                    </h4>
                    <p className="text-sm font-medium text-slate-800">
                       {result.recommendedPesticide}
                    </p>
                 </div>
               </div>
               
               <p className="text-xs text-center font-medium text-slate-400 mt-8 pt-4 border-t border-slate-100">
                 Disclaimer: AI models can make mistakes. Please verify with a local agricultural expert if unsure.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
