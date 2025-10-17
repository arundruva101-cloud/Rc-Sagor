import React, { useState, useMemo, useRef } from 'react';
import { Movie } from './types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon, SearchIcon, PhotoIcon } from './components/icons';
import MovieModal from './components/MovieModal';
import AddEditMovieModal from './components/AddEditMovieModal';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [initialDateForModal, setInitialDateForModal] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [movieForPosterChange, setMovieForPosterChange] = useState<Movie | null>(null);

  const filteredMovies = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    const upcomingMovies = movies.filter(movie => {
      const [year, month, day] = movie.releaseDate.split('-').map(Number);
      const movieDate = new Date(year, month - 1, day);
      return movieDate >= today;
    });

    return searchQuery
      ? upcomingMovies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : upcomingMovies;
  }, [movies, searchQuery]);

  const groupedMovies = useMemo(() => {
    return movies.reduce((acc, movie) => {
      const date = movie.releaseDate.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(movie);
      return acc;
    }, {} as Record<string, Movie[]>);
  }, [movies]);

  const changeMonth = (offset: number) => {
    setSearchQuery('');
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));
  };
  
  const handleSaveMovie = (movieToSave: Movie) => {
    const isEditing = movies.some(m => m.title === movieToEdit?.title && m.releaseDate === movieToEdit?.releaseDate);
    if(isEditing && movieToEdit) {
       setMovies(prev => prev.map(m => m.title === movieToEdit.title && m.releaseDate === movieToEdit.releaseDate ? movieToSave : m));
       setToast({ message: `${movieToSave.title} updated successfully!`, type: 'success' });
    } else {
       setMovies(prev => [...prev, movieToSave].sort((a,b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()));
       setToast({ message: `${movieToSave.title} added successfully!`, type: 'success' });
    }
    closeAddEditModal();
  }

  const handleDeleteMovie = (movieToDelete: Movie) => {
    if(window.confirm(`Are you sure you want to delete "${movieToDelete.title}"?`)) {
       setMovies(prev => prev.filter(m => !(m.title === movieToDelete.title && m.releaseDate === movieToDelete.releaseDate)));
       setToast({ message: `${movieToDelete.title} deleted.`, type: 'success' });
    }
  }
  
  const openEditModal = (movie: Movie) => {
    setMovieToEdit(movie);
    setIsAddEditModalOpen(true);
  }
  
  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setMovieToEdit(null);
    setInitialDateForModal(undefined);
  }

  const handleDayClick = (dateStr: string) => {
    setMovieToEdit(null);
    setInitialDateForModal(dateStr);
    setIsAddEditModalOpen(true);
  };

  const triggerPosterChange = (movie: Movie) => {
    setMovieForPosterChange(movie);
    fileInputRef.current?.click();
  };

  const handlePosterFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && movieForPosterChange) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPosterUrl = e.target?.result as string;
        setMovies(prevMovies => prevMovies.map(m => 
          m.title === movieForPosterChange.title && m.releaseDate === movieForPosterChange.releaseDate
            ? { ...m, posterUrl: newPosterUrl }
            : m
        ));
        setToast({ message: `Poster for ${movieForPosterChange.title} updated.`, type: 'success'});
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
    setMovieForPosterChange(null);
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const CalendarPoster = ({ movie }: { movie: Movie }) => (
    <img
      src={movie.posterUrl}
      onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/200/300`; }}
      alt={movie.title}
      className="w-full h-full object-cover"
    />
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col bg-gradient-to-b from-gray-900 via-indigo-900 to-rose-900/80">
      <header className="bg-transparent backdrop-blur-sm sticky top-0 z-40 h-[80px] flex-shrink-0">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Upcoming Movies</h1>
          <div className="relative flex-1 max-w-xs sm:max-w-xl mx-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type="text"
                placeholder="Search upcoming titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700/50 border border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 transition-colors w-full"
            />
          </div>
           <div className="flex items-center gap-2">
             <button
                onClick={() => { setInitialDateForModal(undefined); setMovieToEdit(null); setIsAddEditModalOpen(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
             >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden md:inline">Add Movie</span>
            </button>
           </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row md:h-[calc(100vh-80px)]">
        {/* Left Side: Movie Feed */}
        <div className="w-full md:w-96 flex-shrink-0 p-4 md:p-6 md:overflow-y-auto">
          {filteredMovies.length > 0 ? (
            <div className="flex flex-col items-center gap-8">
              {filteredMovies.map(movie => (
                <div key={`${movie.title}-${movie.releaseDate}`} className="w-full max-w-xs md:max-w-none mx-auto relative group rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 group-hover:ring-2 group-hover:ring-indigo-500">
                  {movie.tag?.text && (
                    <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 ${movie.tag.color}`}>
                      {movie.tag.text}
                    </div>
                  )}
                  <img src={movie.posterUrl} 
                       onClick={() => setSelectedMovie(movie)}
                       onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/400/600`; }} 
                       alt={movie.title} 
                       className="w-full h-full object-cover cursor-pointer" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />

                  <div className="absolute top-0 inset-x-0 p-3">
                    <h3 className="text-white font-bold text-md">{movie.title}</h3>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-indigo-300 text-xs text-right">
                        <span className="font-semibold">Release Date:</span> {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </p>
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => triggerPosterChange(movie)} title="Change Poster" className="bg-gray-800/80 p-2 rounded-full text-white hover:bg-indigo-500"><PhotoIcon className="w-5 h-5" /></button>
                      <button onClick={() => openEditModal(movie)} title="Edit Details" className="bg-gray-800/80 p-2 rounded-full text-white hover:bg-indigo-500"><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteMovie(movie)} title="Delete Movie" className="bg-gray-800/80 p-2 rounded-full text-white hover:bg-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center h-full flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-semibold text-gray-400">
                  {searchQuery ? `No movies found` : "No upcoming movies."}
                </h2>
                <p className="text-gray-500 mt-2">
                  {searchQuery ? `Try clearing your search.` : "Add a movie to get started."}
                </p>
            </div>
          )}
        </div>

        {/* Right Side: Calendar */}
        <div className="w-full md:flex-grow p-4 md:p-6 overflow-y-auto md:overflow-y-visible">
          <div className="md:sticky md:top-6 bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 p-4 rounded-xl shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <h2 className="text-xl md:text-2xl font-semibold text-center text-indigo-300">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-700/40 rounded-lg overflow-hidden">
              {useMemo(() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const days = [];
                
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`pad-${i}`} className="bg-slate-900/30 aspect-square"></div>);
                }
                
                for (let i = 1; i <= daysInMonth; i++) {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                  const moviesForDay = groupedMovies[dateStr] || [];
                  const movieCount = moviesForDay.length;
                  const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
                  
                  days.push(
                    <div
                      key={dateStr}
                      onClick={() => handleDayClick(dateStr)}
                      className="relative aspect-square group bg-slate-900/40 p-1 flex transition-all duration-300 cursor-pointer hover:bg-slate-800/60"
                    >
                      {movieCount > 0 && (
                        <div className="absolute inset-0 w-full h-full opacity-30 group-hover:opacity-60 transition-opacity duration-300">
                          {movieCount === 1 && <CalendarPoster movie={moviesForDay[0]} />}
                          {movieCount === 2 && (
                            <div className="grid grid-cols-2 h-full"><CalendarPoster movie={moviesForDay[0]} /><CalendarPoster movie={moviesForDay[1]} /></div>
                          )}
                          {movieCount === 3 && (
                            <div className="grid grid-cols-2 grid-rows-2 h-full">
                              <div className="row-span-2"><CalendarPoster movie={moviesForDay[0]} /></div>
                              <CalendarPoster movie={moviesForDay[1]} />
                              <CalendarPoster movie={moviesForDay[2]} />
                            </div>
                          )}
                           {movieCount >= 4 && (
                            <div className="grid grid-cols-2 grid-rows-2 h-full">
                              <CalendarPoster movie={moviesForDay[0]} />
                              <CalendarPoster movie={moviesForDay[1]} />
                              <CalendarPoster movie={moviesForDay[2]} />
                              <div className="bg-slate-800/80 flex items-center justify-center">
                                <span className="text-lg font-bold text-slate-300">+{movieCount - 3}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isToday && <div className="absolute inset-0 ring-2 ring-indigo-500 ring-inset rounded-lg pointer-events-none"></div>}
                      
                      <span className={`relative z-10 text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-gray-200'}`} style={{textShadow: '0 0 5px black'}}>
                        {i}
                      </span>
                    </div>
                  );
                }
                return days;
              }, [currentDate, groupedMovies])}
            </div>
          </div>
        </div>
      </main>

      <input type="file" ref={fileInputRef} onChange={handlePosterFileChange} accept="image/*" className="hidden" />
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      <AddEditMovieModal 
        isOpen={isAddEditModalOpen}
        onClose={closeAddEditModal}
        onSave={handleSaveMovie}
        movieToEdit={movieToEdit}
        initialDate={initialDateForModal}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;