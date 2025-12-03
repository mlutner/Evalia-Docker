import React from 'react';
import { useLocation } from 'wouter';
import { X, Wand2, FileText, Pencil, ArrowRight } from 'lucide-react';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSurveyModal({ isOpen, onClose }: CreateSurveyModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleOptionClick = (path: string) => {
    onClose();
    setLocation(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create New Survey
              </h2>
              <p className="text-sm text-gray-500">
                Choose how you'd like to start building your survey
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: AI Draft */}
            <button
              onClick={() => handleOptionClick('/ai-generate')}
              className="group bg-white border-2 border-gray-200 rounded-xl p-6 text-left 
                       hover:border-purple-400 hover:shadow-lg hover:-translate-y-1
                       transition-all duration-200 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 
                            flex items-center justify-center mb-4 shadow-lg 
                            group-hover:scale-110 transition-transform">
                <Wand2 size={24} className="text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                AI Draft
              </h3>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Describe your survey goals and let AI generate questions for you
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                <span>Start with AI</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded">
                  FASTEST
                </span>
              </div>
            </button>

            {/* Option 2: Template */}
            <button
              onClick={() => handleOptionClick('/templates')}
              className="group bg-white border-2 border-gray-200 rounded-xl p-6 text-left 
                       hover:border-blue-400 hover:shadow-lg hover:-translate-y-1
                       transition-all duration-200 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 
                            flex items-center justify-center mb-4 shadow-lg 
                            group-hover:scale-110 transition-transform">
                <FileText size={24} className="text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Use Template
              </h3>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Browse pre-built surveys for common use cases and customize them
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                <span>Browse Templates</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                  RECOMMENDED
                </span>
              </div>
            </button>

            {/* Option 3: From Scratch */}
            <button
              onClick={() => handleOptionClick('/builder-v2/new')}
              className="group bg-white border-2 border-gray-200 rounded-xl p-6 text-left 
                       hover:border-gray-400 hover:shadow-lg hover:-translate-y-1
                       transition-all duration-200 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 
                            flex items-center justify-center mb-4 shadow-lg 
                            group-hover:scale-110 transition-transform">
                <Pencil size={24} className="text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                Build from Scratch
              </h3>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Start with a blank canvas and build your survey from the ground up
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>Start Building</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                  FULL CONTROL
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            All options lead to the Survey Builder where you can customize your questions
          </p>
        </div>
      </div>
    </div>
  );
}

