import React, { useState, useEffect } from 'react';
import './App.css';
import roundParticipantsData from './round-participants.json';

function App() {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [opponents, setOpponents] = useState({});

  useEffect(() => {
    try {
      if (roundParticipantsData.teams && Array.isArray(roundParticipantsData.teams)) {
        const groupedTeams = roundParticipantsData.teams.reduce((acc, team) => {
          if (!acc[team.pot]) {
            acc[team.pot] = [];
          }
          acc[team.pot].push(team);
          return acc;
        }, {});
        setTeams(groupedTeams);
      } else {
        throw new Error('Invalid data structure in JSON file');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load participant data');
    }
  }, []);

  const renderTeamLogo = (team) => (
    <img
      src={team.logoUrl}
      alt={`${team.name} logo`}
      className="team-logo"
      onError={(e) => { e.target.onerror = null; e.target.src = '/team-logos/default.png'; }}
    />
  );

  const getCountryFlag = (country) => {
    const countryCode = {
      'England': 'gb-eng',
      'France': 'fr',
      'Austria': 'at',
      'Switzerland': 'ch',
      'Czech Republic': 'cz',
      'Germany': 'de',
      'Belgium': 'be',
      'Scotland': 'gb-sct',
      'Spain': 'es',
      'Italy': 'it',
      'Netherlands': 'nl',
      'Portugal': 'pt',
      'Ukraine': 'ua'
    }[country] || 'unknown';

    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${country} flag`}
        className="country-flag"
      />
    );
  };

  const selectTeam = (team) => {
    setSelectedTeam(team);
    generateOpponents(team);
  };

  const generateOpponents = (team) => {
    const potOpponents = {1: [], 2: [], 3: [], 4: []};
    
    const shuffledTeams = [...roundParticipantsData.teams].sort(() => Math.random() - 0.5);
    
    shuffledTeams.forEach(opponent => {
      if (opponent.country !== team.country && opponent !== team) {
        if (potOpponents[opponent.pot].length < 2) {
          potOpponents[opponent.pot].push({
            ...opponent,
            isHome: potOpponents[opponent.pot].length === 0
          });
        }
      }
    });

    setOpponents(potOpponents);
  };

  const resetSelection = () => {
    setSelectedTeam(null);
    setOpponents({});
  };

  if (error) {
    return <div className="App"><header className="App-header"><p>{error}</p></header></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>UEFA Champions League Participants</h1>
      </header>
      <main>
        {!selectedTeam ? (
          teams ? (
            <section className="round-section">
              <h2>League Phase Teams</h2>
              {[1, 2, 3, 4].map(pot => (
                <div key={pot} className="pot-section">
                  <h3>Pot {pot}</h3>
                  <div className="teams-grid">
                    {teams[pot] && teams[pot].length > 0 ? (
                      teams[pot].map((team, index) => (
                        <div key={index} className="team-card" onClick={() => selectTeam(team)}>
                          {renderTeamLogo(team)}
                          <span className="team-name">{team.name}</span>
                          <span className="team-code">({team.code})</span>
                          {getCountryFlag(team.country)}
                        </div>
                      ))
                    ) : (
                      <p>No teams in this pot</p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <p>Loading teams...</p>
          )
        ) : (
          <div className="draw-results">
            <button onClick={resetSelection}>Back to Teams</button>
            <h2>Potential Opponents for {selectedTeam.name}</h2>
            {[1, 2, 3, 4].map(pot => (
              <div key={pot} className="pot-opponents">
                <h3>Pot {pot}</h3>
                <ul>
                  {opponents[pot] && opponents[pot].map((opponent, index) => (
                    <li key={index} className="match-display">
                      {opponent.isHome ? (
                        <>
                          {renderTeamLogo(selectedTeam)}
                          <span className="team-name">{selectedTeam.name}</span>
                          <span className="vs">vs</span>
                          <span className="team-name">{opponent.name}</span>
                          {renderTeamLogo(opponent)}
                        </>
                      ) : (
                        <>
                          {renderTeamLogo(opponent)}
                          <span className="team-name">{opponent.name}</span>
                          <span className="vs">vs</span>
                          <span className="team-name">{selectedTeam.name}</span>
                          {renderTeamLogo(selectedTeam)}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button onClick={resetSelection}>Back to Teams</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;