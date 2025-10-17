import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { identifyMovieFromPoster } from '../services/geminiService';
import { Movie } from '../types';
import { XMarkIcon, CheckIcon, PencilIcon } from './icons';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: (movie: Movie) => void;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, onMovieAdded, setToast }) => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [identifiedMovie, setIdentifiedMovie] = useState<Movie | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const resetState = () => {
    setBase64Image(null);
    setMimeType(null);
    setIsLoading(false);
    setIdentifiedMovie(null);
    setIsEditing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setIsLoading(true);
    setIdentifiedMovie(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setBase64Image(base64);
      setMimeType(file.type);
      try {
        const movie = await identifyMovieFromPoster(base64, file.type);
        setIdentifiedMovie({...movie, posterUrl: result});
      } catch (error: any) {
        setToast({ message: error.message || 'Failed to identify movie.', type: 'error' });
        resetState();
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setToast({ message: 'Failed to read the image file.', type: 'error' });
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [setToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });
  
  const handleAddMovie = () => {
      if (identifiedMovie) {
          onMovieAdded(identifiedMovie);
          setToast({ message: `${identifiedMovie.title} added successfully!`, type: 'success'});
          handleClose();
      }
  };

  const handleInputChange = (field: keyof Movie, value: string | string[]) => {
    if(identifiedMovie) {
        setIdentifiedMovie({ ...identifiedMovie, [field]: value });
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={handleClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add Movie from Poster</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!identifiedMovie && (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-400 bg-gray-700' : 'border-gray-600 hover:border-indigo-500'}`}>
              <input {...getInputProps()} />
              {isLoading ? (
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Identifying movie...</p>
                </div>
              ) : (
                <p className="text-gray-400">{isDragActive ? "Drop the image here..." : "Drag 'n' drop a movie poster here, or click to select a file"}</p>
              )}
            </div>
          )}

          {identifiedMovie && (
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex-shrink-0">
                    <img src={`data:${mimeType};base64,${base64Image}`} alt="Uploaded poster preview" className="rounded-lg shadow-lg w-full object-cover"/>
                </div>
                <div className="md:w-2/3">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-white pr-2">{identifiedMovie.title}</h3>
                        <button onClick={() => setIsEditing(!isEditing)} className="flex-shrink-0 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                            {isEditing ? <CheckIcon className="w-5 h-5"/> : <PencilIcon className="w-5 h-5" />}
                            {isEditing ? 'Done' : 'Edit'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-400">Title</label>
                            <input type="text" value={identifiedMovie.title} onChange={(e) => handleInputChange('title', e.target.value)} disabled={!isEditing} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-white disabled:opacity-70"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Release Date</label>
                            <input type="date" value={identifiedMovie.releaseDate} onChange={(e) => handleInputChange('releaseDate', e.target.value)} disabled={!isEditing} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-white disabled:opacity-70"/>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
        
        {identifiedMovie && (
            <div className="p-6 border-t border-gray-700 bg-gray-800 mt-auto">
                <button 
                    onClick={handleAddMovie}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500"
                    disabled={isLoading}
                >
                   Add Movie to Calendar
                </button>
            </div>
        )}
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

export default AddMovieModal;