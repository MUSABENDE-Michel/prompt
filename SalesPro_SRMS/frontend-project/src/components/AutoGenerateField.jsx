import useAutoGenerate from '../hooks/useAutoGenerate';

export default function AutoGenerateField({ type, value, onChange, label }) {
  const { loading, generate } = useAutoGenerate();

  const handleGenerate = async () => {
    const code = await generate(type);
    if (code && onChange) onChange(code);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label || `${type.charAt(0).toUpperCase() + type.slice(1)} Code/Number`}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          placeholder={`Auto-generated ${label || type}`}
          readOnly
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
        >
          {loading ? '...' : 'Auto'}
        </button>
      </div>
    </div>
  );
}
