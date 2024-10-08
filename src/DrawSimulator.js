import React, { useState, useEffect } from 'react';
import roundParticipantsData from './round-participants.json';

function DrawSimulator() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [opponents, setOpponents] = useState({});
  const [secondaryTeam, setSecondaryTeam] = useState(null);
  const [secondaryOpponents, setSecondaryOpponents] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (roundParticipantsData.teams && Array.isArray(roundParticipantsData.teams)) {
        const sortedTeams = roundParticipantsData.teams.sort((a, b) => {
          if (a.pot !== b.pot) {
            return a.pot - b.pot; // Sort by pot first
          }
          return a.country.localeCompare(b.country); // Then by country
        });
        setTeams(sortedTeams);
      } else {
        throw new Error('Invalid data structure in JSON file');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load team data');
    }
  }, []);

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setSecondaryTeam(null);
    setSecondaryOpponents({});
    generateOpponents(team);
  };

  const selectSecondaryTeam = (team) => {
    setSecondaryTeam(team);
    generateOpponents(team, setSecondaryOpponents, selectedTeam);
  };

  const generateOpponents = (team, setOpponentsFunction = setOpponents, fixedOpponent = null) => {
    const potOpponents = {1: [], 2: [], 3: [], 4: []};
    
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    // If there's a fixed opponent, add it first
    if (fixedOpponent) {
      potOpponents[fixedOpponent.pot].push({
        ...fixedOpponent,
        isHome: Math.random() < 0.5 // Randomize home/away for the fixed opponent
      });
    }

    shuffledTeams.forEach(opponent => {
      if (opponent.country !== team.country && opponent !== team && opponent !== fixedOpponent) {
        if (potOpponents[opponent.pot].length < 2) {
          potOpponents[opponent.pot].push({
            ...opponent,
            isHome: potOpponents[opponent.pot].length === 0
          });
        }
      }
    });

    // Ensure each pot has exactly two opponents if possible
    Object.keys(potOpponents).forEach(pot => {
      if (potOpponents[pot].length === 1 && parseInt(pot) !== team.pot) {
        const additionalOpponent = shuffledTeams.find(t => 
          t.pot === parseInt(pot) && 
          t.country !== team.country && 
          t !== potOpponents[pot][0] &&
          !potOpponents[pot].includes(t)
        );
        if (additionalOpponent) {
          potOpponents[pot].push({
            ...additionalOpponent,
            isHome: !potOpponents[pot][0].isHome
          });
        }
      }
    });

    setOpponentsFunction(potOpponents);
  };

  const resetSelection = () => {
    setSelectedTeam(null);
    setOpponents({});
    setSecondaryTeam(null);
    setSecondaryOpponents({});
  };

  const getCountryCode = (country) => {
    const countryMap = {
      'England': 'gb-eng',
      'France': 'fr',
      'Germany': 'de',
      'Belgium': 'be',
      'Scotland': 'gb-sct',
      'Spain': 'es',
      'Italy': 'it',
      'Netherlands': 'nl',
      'Austria': 'at',
      'Portugal': 'pt',
      'Ukraine': 'ua',
      'Czechia': 'cz',
      'Türkiye': 'tr',
      'Norway': 'no',
      'Croatia': 'hr',
      'Slovakia': 'sk'
    };
    return countryMap[country] || 'unknown';
  };

  const renderTeam = (team, onClick = null) => (
    <span className={`team-display ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <img 
        src={`https://flagcdn.com/24x18/${getCountryCode(team.country)}.png`} 
        alt={`${team.country} flag`}
        className="country-flag"
      />
      {team.name} ({team.code}) 
      <span className={`pot-tag pot-${team.pot}`}>Pot {team.pot}</span>
    </span>
  );

  if (error) {
    return <div className="DrawSimulator"><p>Error: {error}</p></div>;
  }

  return (
    <div className="DrawSimulator">
      <h1>UEFA Champions League Draw Simulator</h1>
      {!selectedTeam ? (
        <div className="team-selection">
          <h2>Select a Team</h2>
          <ul>
            {teams.map((team, index) => (
              <li key={index} onClick={() => selectTeam(team)}>
                {renderTeam(team)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="draw-results">
          <h2>Potential Opponents for {selectedTeam.name}</h2>
          {[1, 2, 3, 4].map(pot => (
            <div key={pot} className="pot-opponents">
              <h3>Pot {pot}</h3>
              <ul>
                {opponents[pot] && opponents[pot].map((opponent, index) => (
                  <li key={index} className="match-display">
                    {opponent.isHome ? (
                      <>
                        {renderTeam(selectedTeam)}
                        <span className="vs">vs</span>
                        {renderTeam(opponent, () => selectSecondaryTeam(opponent))}
                      </>
                    ) : (
                      <>
                        {renderTeam(opponent, () => selectSecondaryTeam(opponent))}
                        <span className="vs">vs</span>
                        {renderTeam(selectedTeam)}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {secondaryTeam && (
            <div className="secondary-draw">
              <h3>Potential Opponents for {secondaryTeam.name}</h3>
              {[1, 2, 3, 4].map(pot => (
                <div key={pot} className="pot-opponents">
                  <h4>Pot {pot}</h4>
                  <ul>
                    {secondaryOpponents[pot] && secondaryOpponents[pot].map((opponent, index) => (
                      <li key={index} className="match-display">
                        {opponent.isHome ? (
                          <>
                            {renderTeam(secondaryTeam)}
                            <span className="vs">vs</span>
                            {renderTeam(opponent)}
                          </>
                        ) : (
                          <>
                            {renderTeam(opponent)}
                            <span className="vs">vs</span>
                            {renderTeam(secondaryTeam)}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <button onClick={resetSelection}>Select Another Team</button>
        </div>
      )}
    </div>
  );
}

export default DrawSimulator;