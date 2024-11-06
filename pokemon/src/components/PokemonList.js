import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPokemons } from '../redux/pokemonSlice';
import './PokemonList.css';

const PokemonList = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.pokemon);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);

  useEffect(() => {
    dispatch(fetchPokemons());
  }, [dispatch]);

  const getTypeColor = (type) => {
    const colors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[type] || '#777';
  };

  const fetchPokemonDetails = async (pokemon) => {
    try {

      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
      const details = await response.json();

      const speciesResponse = await fetch(details.species.url);
      const speciesData = await speciesResponse.json();

      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();

      setPokemonDetails(details);
      await processEvolutionChain(evolutionData.chain);
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
    }
  };

  const processEvolutionChain = async (chain) => {
    const evoChain = [];
    let currentEvo = chain;

    do {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentEvo.species.name}`);
      const pokemonData = await response.json();

      evoChain.push({
        name: currentEvo.species.name,
        sprite: pokemonData.sprites.front_default,
        min_level: currentEvo.evolution_details[0]?.min_level
      });

      currentEvo = currentEvo.evolves_to[0];
    } while (currentEvo && currentEvo.hasOwnProperty('evolves_to'));

    setEvolutionChain(evoChain);
  };

  const handleCardClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
    await fetchPokemonDetails(pokemon);
  };

  const closeModal = () => {
    setSelectedPokemon(null);
    setPokemonDetails(null);
    setEvolutionChain(null);
  };

  const StatBar = ({ statName, value }) => (
    <div className="stat-bar">
      <span className="stat-name">{statName}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar-bg">
        <div 
          className="stat-bar-fill" 
          style={{ 
            width: `${(value / 255) * 100}%`, 
            backgroundColor: value > 150 ? '#4CAF50' : value > 100 ? '#2196F3' : '#FF9800' 
          }}
        />
      </div>
    </div>
  );

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading Pokémon...</p>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <div className="pokemon-container">
      <div className="pokemon-header">
        <h1>Pokédex</h1>
      </div>
      
      <div className="pokemon-grid">
        {data && data.length > 0 ? (
          data.map((pokemon, index) => (
            <div
              key={index}
              className="pokemon-card"
              onClick={() => handleCardClick(pokemon)}
            >
              <span className="pokemon-id">#{(index + 1).toString().padStart(3, '0')}</span>
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`}
                alt={pokemon.name}
              />
              <h3>{pokemon.name}</h3>
            </div>
          ))
        ) : (
          <p>No Pokémon found</p>
        )}
      </div>

      {selectedPokemon && pokemonDetails && (
        <div className="pokemon-modal" onClick={(e) => e.target.className === 'pokemon-modal' && closeModal()}>
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>&times;</button>
            
            <div className="pokemon-detail-header">
              <img
                src={pokemonDetails.sprites.front_default}
                alt={pokemonDetails.name}
              />
              <div>
                <h2 style={{ textTransform: 'capitalize', marginBottom: '10px' }}>
                  {pokemonDetails.name} #{pokemonDetails.id.toString().padStart(3, '0')}
                </h2>
                <div className="pokemon-types">
                  {pokemonDetails.types.map((type, index) => (
                    <span
                      key={index}
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(type.type.name) }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="section-title">Base Stats</h3>
            <div className="stats-container">
              {pokemonDetails.stats.map((stat, index) => (
                <StatBar
                  key={index}
                  statName={stat.stat.name.replace('-', ' ')}
                  value={stat.base_stat}
                />
              ))}
            </div>

            <h3 className="section-title">Abilities</h3>
            <div className="abilities-list">
              {pokemonDetails.abilities.map((ability, index) => (
                <span key={index} className="ability-badge">
                  {ability.ability.name.replace('-', ' ')}
                  {ability.is_hidden && ' (Hidden)'}
                </span>
              ))}
            </div>

            {evolutionChain && evolutionChain.length > 1 && (
              <>
                <h3 className="section-title">Evolution Chain</h3>
                <div className="evolution-chain">
                  {evolutionChain.map((evo, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="evolution-arrow">→</span>}
                      <div className="evolution-item">
                        <img src={evo.sprite} alt={evo.name} />
                        <p style={{ textTransform: 'capitalize' }}>{evo.name}</p>
                        {evo.min_level && <small>Level {evo.min_level}</small>}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}

            <h3 className="section-title">Physical Characteristics</h3>
            <div className="stats-container">
              <p>Height: {pokemonDetails.height / 10}m</p>
              <p>Weight: {pokemonDetails.weight / 10}kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonList;