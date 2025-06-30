import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import  {getApiUrl}  from '../config/config.js';
import { FaBrain, FaLightbulb, FaUtensils, FaDumbbell, FaHeartbeat } from 'react-icons/fa';

const AiSuggestions = ({ member }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const getSuggestions = async () => {
    try {
      setLoading(true);
      setSuggestions([]);
      setAnalysis(null);
      const { data } = await axios.post(
        `${getApiUrl()}/api/ai/suggestions`,
        { member },
        { withCredentials: true }
      );

      if (data.success) {
        setSuggestions(data.suggestions);
        setAnalysis(data.analysis);
        toast.success('Suggestions generated!');
      } else {
        toast.error(data.message || 'Failed to get suggestions.');
      }
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Nutrition': return <FaUtensils className="text-orange-400" />;
      case 'Workout': return <FaDumbbell className="text-blue-400" />;
      default: return <FaHeartbeat className="text-pink-400" />;
    }
  }

  return (
    <div className="bg-white/10 rounded-xl border border-white/10 mt-6">
      <div className="p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FaBrain className="text-2xl text-purple-400" />
                <h2 className="text-xl font-bold">AI-Powered Suggestions</h2>
            </div>
            <button
            onClick={getSuggestions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-all"
            >
            <FaLightbulb />
            {loading ? 'Analyzing...' : 'Generate Advice'}
            </button>
        </div>

        {analysis && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center bg-black/20 p-4 rounded-lg">
                <div>
                    <p className="text-sm text-gray-400">BMI</p>
                    <p className="text-xl font-bold text-white">{analysis.bmi}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">BMI Category</p>
                    <p className="text-xl font-bold text-white">{analysis.bmiCategory}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Active Days/Week</p>
                    <p className="text-xl font-bold text-white">{analysis.activeDays}</p>
                </div>
            </div>
        )}

        <div className="mt-4 space-y-4">
          {suggestions.map((s, index) => (
            <div key={index} className="flex items-start gap-4 bg-white/5 p-4 rounded-lg">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30">
                {getCategoryIcon(s.category)}
              </div>
              <div>
                <h4 className="font-semibold text-white">{s.category}</h4>
                <p className="text-gray-300">{s.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiSuggestions; 