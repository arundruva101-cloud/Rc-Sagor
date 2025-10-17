import React from 'react';
import { Movie } from '../types';
import { XMarkIcon } from './icons';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img 
            src={movie.posterUrl} 
            alt={`Poster for ${movie.title}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = `https://picsum.photos/seed/${movie.title}/500/750`;
            }}
          />
        </div>
        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-8 h-8" />
          </button>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 pr-10">{movie.title}</h2>
          <p className="text-sm text-indigo-400 font-semibold mb-4">Release Date: {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres?.map(genre => (
              <span key={genre} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full">{genre}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
             <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Main Cast</h3>
               <ul className="space-y-1 text-gray-400 max-h-48 overflow-y-auto">
                {movie.cast?.map(actor => (
                  <li key={actor}>{actor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
       <style>{`
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

export default MovieModal;