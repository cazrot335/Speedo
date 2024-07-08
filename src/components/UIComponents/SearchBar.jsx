
import React from 'react';
import '../style.css';

const SearchBar = ({ placeName, setPlaceName, handlePlaceNameSubmit }) => {
  return (
    <form onSubmit={handlePlaceNameSubmit} className="place-search-form">
      <label className="relative block search-bar-container">
        
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <svg className="h-5 w-5 fill-slate-300" viewBox="0 0 20 20">
           
          </svg>
        </span>
        <input
          className="placeholder:italic placeholder:text-slate-400 block bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm search-input"
          placeholder="Search for a place"
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          required
        />
        <button className="search-button" type="submit">

        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24">
<path d="M 10 2 C 5.589 2 2 5.589 2 10 C 2 14.411 5.589 18 10 18 C 11.936 18 13.713609 17.307203 15.099609 16.158203 L 20.720703 21.779297 C 20.866703 21.925297 21.058 22 21.25 22 C 21.442 22 21.633297 21.926297 21.779297 21.779297 C 22.072297 21.486297 22.072297 21.013703 21.779297 20.720703 L 16.158203 15.099609 C 17.307203 13.713609 18 11.936 18 10 C 18 5.589 14.411 2 10 2 z M 10 3.5 C 13.584 3.5 16.5 6.416 16.5 10 C 16.5 13.584 13.584 16.5 10 16.5 C 6.416 16.5 3.5 13.584 3.5 10 C 3.5 6.416 6.416 3.5 10 3.5 z M 10 5 A 5 5 0 0 0 10 15 A 5 5 0 0 0 10 5 z"></path>
</svg>


        </button>
      </label>
    </form>
  );
};

export default SearchBar;
