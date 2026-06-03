import { RefreshCw } from 'lucide-react';

export default function AutoGenerateField({ label, value, onGenerate, readOnly = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
        />
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Generate"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
