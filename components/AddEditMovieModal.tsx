import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { XMarkIcon } from './icons';

interface AddEditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movie: Movie) => void;
  movieToEdit?: Movie | null;
  initialDate?: string; // YYYY-MM-DD
}

const tagColors = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Yellow', class: 'bg-yellow-500' },
  { name: 'Purple', class: 'bg-purple-500' },
];

const AddEditMovieModal: React.FC<AddEditMovieModalProps> = ({ isOpen, onClose, onSave, movieToEdit, initialDate }) => {
  const [formData, setFormData] = useState<Partial<Movie>>({});
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (movieToEdit) {
        setFormData(movieToEdit);
      } else {
        setFormData({
          title: '',
          releaseDate: initialDate || new Date().toISOString().split('T')[0],
          posterUrl: '',
          genres: [],
          cast: [],
          tag: { text: '', color: tagColors[0].class }
        });
      }
    }
  }, [movieToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'genres' | 'cast') => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, [field]: value.split(',').map(item => item.trim()) }));
  }

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.releaseDate) {
      const finalData = { ...formData };
      if (!finalData.tag?.text?.trim()) {
        delete finalData.tag;
      }
      onSave(finalData as Movie);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{movieToEdit ? 'Edit Movie' : 'Add Movie'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">Title</label>
            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">Release Date</label>
            <input type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">Poster</label>
            <div className="mt-2 flex items-center gap-4">
              {formData.posterUrl && (
                <img 
                  src={formData.posterUrl} 
                  alt="Poster preview" 
                  className="w-20 h-32 object-cover rounded-md bg-gray-700 flex-shrink-0"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                  onLoad={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'block'; }}
                />
              )}
              <div className="flex-grow">
                <input 
                  type="text" 
                  name="posterUrl"
                  placeholder="Paste URL or upload image"
                  value={formData.posterUrl || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" 
                />
                <button 
                  type="button" 
                  onClick={() => posterInputRef.current?.click()}
                  className="mt-2 w-full text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Upload Image
                </button>
              </div>
            </div>
            <input type="file" ref={posterInputRef} onChange={handlePosterUpload} accept="image/*" className="hidden" />
          </div>
           <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">Genres (comma-separated)</label>
            <input type="text" name="genres" value={formData.genres?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'genres')} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">Cast (comma-separated)</label>
            <input type="text" name="cast" value={formData.cast?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'cast')} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
          </div>
          <div className="pt-2">
              <h3 className="text-md font-semibold text-gray-300 mb-2">Custom Tag (Optional)</h3>
               <div>
                <label className="text-sm font-medium text-gray-400 block mb-1">Tag Text</label>
                <input 
                    type="text" 
                    placeholder="e.g., Must Watch!"
                    value={formData.tag?.text || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: { ...prev.tag, text: e.target.value, color: prev.tag?.color || tagColors[0].class } }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
              </div>
               <div className="mt-3">
                <label className="text-sm font-medium text-gray-400 block mb-1">Tag Color</label>
                <div className="flex gap-3">
                  {tagColors.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tag: { ...(prev.tag || { text: '' }), color: color.class } }))}
                      className={`w-8 h-8 rounded-full ${color.class} transition-transform hover:scale-110 ${formData.tag?.color === color.class ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
          </div>
        </form>
         <div className="p-6 border-t border-gray-700 bg-gray-800 mt-auto">
            <button 
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
               Save Movie
            </button>
        </div>
      </div>
       <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddEditMovieModal;
