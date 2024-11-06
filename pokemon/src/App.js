import React from 'react';
import PokemonList from './components/PokemonList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" // Gambar Pikachu, bisa diganti dengan logo lain
          alt="Pokemon Logo"
          className="App-logo"
        />
        <h1 className="App-title">Pokemon Card</h1>
      </header>
      <PokemonList />
    </div>
  );
}

export default App;
