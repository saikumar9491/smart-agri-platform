import { useState } from 'react';
import { Sprout, Loader2, MapPin, Droplets, Sun, Wind, TrendingUp } from 'lucide-react';
import { cn } from '../utils/utils';
import { API_URL } from '../config';



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
      // In a real app we would call the backend API here:
      const response = await fetch(`${API_URL}/api/crops/recommend`, {

         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Sprout className="h-8 w-8 text-green-500" />
          AI Crop Recommendation
        </h1>
        <p className="mt-2 text-slate-500">
          Enter your farm's details below to get personalized, data-driven crop suggestions optimized for yield and sustainability.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Farm Parameters</h2>
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
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-inner relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-green-500/10 blur-3xl"></div>
          
          <h2 className="text-lg font-semibold text-slate-800 mb-6 relative z-10">AI Insights</h2>
          
          {!results && !loading && (
            <div className="flex h-64 flex-col items-center justify-center text-center relative z-10">
              <div className="mb-4 rounded-full bg-slate-200 p-4">
                <Sprout className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Submit your farm details to see AI-powered suggestions here.
              </p>
            </div>
          )}

          {loading ? (
            <div className="space-y-4 relative z-10">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-3 h-5 w-1/3 rounded bg-slate-200"></div>
                  <div className="mb-2 h-4 w-full rounded bg-slate-200"></div>
                  <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                </div>
              ))}
            </div>
          ) : results ? (
            <div className="space-y-4 relative z-10">
              {results.map((crop, idx) => (
                <div key={idx} className="group rounded-xl border border-slate-200 border-l-4 border-l-green-500 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
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
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
    </div>
  );
}
