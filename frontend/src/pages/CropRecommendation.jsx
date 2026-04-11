import { useState } from 'react';
import { Sprout, Loader2, MapPin, Droplets, Sun, Wind, TrendingUp } from 'lucide-react';
import { cn } from '../utils/utils';
import { API_URL } from '../config';
import PageBackground from '../components/PageBackground';



export default function CropRecommendation() {
  const [formData, setFormData] = useState({
    soilType: '',
    location: '',
    season: 'Summer',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('agri_token');
      const response = await fetch(`${API_URL}/api/crops/recommend`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      // Simulate network delay for UX
      setTimeout(() => {
        setResults(data.data);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <PageBackground className="mx-auto max-w-5xl space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-2xl">
          <Sprout className="h-8 w-8 text-green-400" />
          AI Crop Recommendation
        </h1>
        <p className="mt-2 text-white/60 font-medium">
          Enter your farm's details below to get personalized, data-driven crop suggestions optimized for yield and sustainability.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <div className="glassmorphic rounded-[32px] p-8">
          <h2 className="text-[11px] font-black text-white/50 mb-6 uppercase tracking-[0.2em]">Farm Parameters</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra, India"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Soil Type</label>
              <select
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              >
                <option value="" disabled>Select soil type</option>
                <option value="Loamy">Loamy - Balanced, holds moisture well</option>
                <option value="Black Soil">Black Soil - Rich in minerals, moisture retentive</option>
                <option value="Clay">Clay - Heavy, nutrient-rich</option>
                <option value="Sandy">Sandy - Drains quickly, warms fast</option>
                <option value="Silty">Silty - Smooth, retains water</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upcoming Season</label>
              <div className="grid grid-cols-3 gap-3">
                {['Summer', 'Monsoon', 'Winter'].map((season) => (
                  <button
                    key={season}
                    type="button"
                    onClick={() => setFormData({ ...formData, season })}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-medium transition-all",
                      formData.season === season
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                'Get Recommendations'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="glassmorphic rounded-[32px] p-8 shadow-inner relative overflow-hidden">
          {/* Glass Reflection Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-30 pointer-events-none" />
          
          <h2 className="text-[11px] font-black text-white/50 mb-6 relative z-10 uppercase tracking-[0.2em]">AI Insights</h2>
          
          {!results && !loading && (
            <div className="flex h-64 flex-col items-center justify-center text-center relative z-10">
              <div className="mb-4 rounded-full bg-white/10 p-4 backdrop-blur-md border border-white/20">
                <Sprout className="h-8 w-8 text-white/30" />
              </div>
              <p className="text-sm font-bold text-white/40">
                Submit your farm details to see AI-powered suggestions here.
              </p>
            </div>
          )}

          {results ? (
            <div className="space-y-4 relative z-10">
              {results.map((crop, idx) => (
                <div key={idx} className="group rounded-2xl border border-white/10 border-l-4 border-l-green-500 bg-white/5 p-5 transition-all hover:bg-white/10 hover:translate-x-1 duration-500 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        {crop.name}
                        {idx === 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Best Match
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{crop.description}</p>
                      
                      {crop.aiInsight && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-indigo-50 p-3 border border-indigo-100/50">
                          <TrendingUp className="mt-0.5 h-4 w-4 text-indigo-500 shrink-0" />
                          <p className="text-xs font-medium text-indigo-700 leading-relaxed italic">
                            <span className="font-bold uppercase tracking-tighter mr-1">AI Reasoning:</span>
                            {crop.aiInsight}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                      <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      {crop.waterRequirement} Water
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      {crop.estimatedYield || 'High Yield'}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      {crop.idealSoil.join(', ')}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      {crop.season.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </PageBackground>
  );
}
