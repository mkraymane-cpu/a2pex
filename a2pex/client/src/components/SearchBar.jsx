import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search club, league, brand, season...' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-11"
      />
    </form>
  );
}
