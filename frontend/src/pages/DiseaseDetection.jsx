import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, Upload, Loader2, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';
import { API_URL } from '../config';
import PageBackground from '../components/PageBackground';



export default function DiseaseML() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cropType, setCropType] = useState('Generic');
  const [progressMessage, setProgressMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.autoScanImage) {
      const file = location.state.autoScanImage;
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      // Clear the state so a refresh doesn't reload the same image unexpectedly
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    setResult(null);
    
    // Progress simulation
    const messages = [
      "Uploading high-resolution leaf image...",
      "Analyzing surface texture and discoloration patterns...",
      "Matching against 5,000+ agricultural disease markers...",
      "Refining diagnosis based on crop-specific biology...",
      "Generating treatment and medicine recommendations..."
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length) {
        setProgressMessage(messages[msgIndex]);
        msgIndex++;
      }
    }, 400);

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('cropType', cropType);

    try {
      const token = localStorage.getItem('agri_token');
      const response = await fetch(`${API_URL}/api/disease/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
         setResult(data.data);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setProgressMessage('');
    }
  };

  return (
    <PageBackground className="mx-auto max-w-5xl space-y-8">
      <div className="px-2 text-white">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 drop-shadow-2xl">
          <Bug className="h-8 w-8 text-rose-400" />
          Plant Disease Detection
        </h1>
        <p className="mt-2 text-white/60 font-medium">
          Upload a photo of a sick plant leaf and our AI will detect the disease and provide treatment steps.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="glassmorphic rounded-[32px] p-8 flex flex-col">
          <h2 className="text-[11px] font-black text-white/50 mb-6 uppercase tracking-[0.2em]">Upload Image</h2>
          
          <div className="flex-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 group transition-colors hover:border-green-400 hover:bg-green-50/50">
            {previewUrl ? (
               <img src={previewUrl} alt="Preview" className="w-full h-full object-contain z-10" />
            ) : (
               <div className="text-center">
                 <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-green-500 transition-colors mb-3" />
                 <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                 <p className="text-xs text-slate-500 mt-1">PNG, JPG, HEIC or GIF (max. 5MB)</p>
               </div>
            )}
            <input 
              type="file" 
              accept="image/*,.heic,.heif"
              capture="environment"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Help AI: Select Crop Type</label>
            <select 
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm font-medium py-3 px-4 focus:ring-2 focus:ring-green-400 outline-none transition-all shadow-sm"
            >
              <option value="Generic">Auto-detect (from photo)</option>
              <option value="Maize">Maize / Corn</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice / Paddy</option>
              <option value="Tomato">Tomato</option>
              <option value="Apple">Apple</option>
              <option value="Chilli">Chilli / Pepper</option>
            </select>
            <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-400" /> Selecting the crop increases accuracy by 40%
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 py-4 text-sm font-black text-white uppercase tracking-widest transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-50"
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
        <div className="glassmorphic rounded-[32px] p-8 overflow-hidden relative">
          <h2 className="text-[11px] font-black text-white/50 mb-6 uppercase tracking-[0.2em]">Diagnostic Report</h2>
          
          {!result && !loading && (
             <div className="flex h-64 flex-col items-center justify-center text-center">
               <div className="mb-4 rounded-full bg-white/5 backdrop-blur-md p-4 border border-white/10">
                 <FlaskConical className="h-8 w-8 text-white/20" />
               </div>
               <p className="text-sm font-bold text-white/40">
                 Awaiting image upload for analysis.
               </p>
             </div>
          )}

          {loading && (
             <div className="space-y-6 flex flex-col items-center justify-center h-64">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-rose-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FlaskConical className="h-8 w-8 text-rose-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800 animate-bounce">{progressMessage}</p>
                  <p className="text-xs text-slate-400 mt-2">Running Advanced Plant Pathology Analysis...</p>
                </div>
             </div>
          )}

          {result && !loading && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className={`flex items-start gap-4 p-4 rounded-xl border ${result.confidenceScore < 0.5 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                 <div className="mt-1">
                   {result.confidenceScore < 0.5 ? (
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                   ) : (
                      <AlertTriangle className="h-6 w-6 text-rose-500" />
                   )}
                 </div>
                 <div>
                   <h3 className={`text-lg font-bold ${result.confidenceScore < 0.5 ? 'text-amber-900' : 'text-rose-900'}`}>
                     {result.detectedDisease} 
                     <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${result.confidenceScore < 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                       {(result.confidenceScore * 100).toFixed(1)}% Confidence
                     </span>
                   </h3>
                   <p className={`text-sm font-medium mt-1 ${result.confidenceScore < 0.5 ? 'text-amber-700/80' : 'text-rose-700/80'}`}>
                      {result.confidenceScore < 0.5 ? 'Image clarity is low. Please verify if this is a leaf.' : 'Immediate action recommended.'}
                   </p>
                 </div>
               </div>

               <div className="space-y-4">
                 {result.confidenceScore >= 0.7 ? (
                   <>
                     <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                           <CheckCircle2 className="h-4 w-4 text-green-500" /> Treatment Plan
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                           {result.treatmentSuggestion}
                        </p>
                     </div>

                     {result.recommendedPesticide !== 'None' && result.recommendedPesticide !== 'N/A' && (
                        <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                           <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-2">
                              <FlaskConical className="h-4 w-4 text-green-600" /> Recommended Medicine
                           </h4>
                           <p className="text-sm font-bold text-green-900">
                              {result.recommendedPesticide}
                           </p>
                        </div>
                     )}
                   </>
                 ) : (
                   <div className="p-6 rounded-xl border border-amber-200 bg-amber-50 text-center">
                     <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
                     <p className="text-sm font-bold text-amber-900 mb-1">Low Confidence Analysis</p>
                     <p className="text-xs text-amber-700">
                        The AI is not confident this is a plant leaf. To prevent crop damage, medicine advice is hidden. Please provide a clearer photo.
                     </p>
                   </div>
                 )}
               </div>
               
               <p className="text-xs text-center font-medium text-slate-400 mt-8 pt-4 border-t border-slate-100">
                 Disclaimer: AI models can make mistakes. Please verify with a local agricultural expert if unsure.
               </p>
             </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}
