import React, { useState, useEffect } from 'react';
import './App.css';
import roundParticipantsData from './round-participants.json';
import DrawSimulator from './DrawSimulator';

function App() {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(null);
  const [showDrawSimulator, setShowDrawSimulator] = useState(false);

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

  const toggleDrawSimulator = () => {
    setShowDrawSimulator(!showDrawSimulator);
  };

  if (error) {
    return <div className="App"><header className="App-header"><p>{error}</p></header></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>UEFA Champions League Participants</h1>
        <button onClick={toggleDrawSimulator}>
          {showDrawSimulator ? "Show Participants" : "Show Draw Simulator"}
        </button>
      </header>
      <main>
        {showDrawSimulator ? (
          <DrawSimulator />
        ) : (
          teams ? (
            <section className="round-section">
              <h2>League Phase Teams</h2>
              {[1, 2, 3, 4].map(pot => (
                <div key={pot} className="pot-section">
                  <h3>Pot {pot}</h3>
                  <div className="teams-inline">
                    {teams[pot] && teams[pot].length > 0 ? (
                      teams[pot].map((team, index) => (
                        <span key={index} className="team-inline">
                          {team.name} ({team.code})
                          {index < teams[pot].length - 1 && ", "}
                        </span>
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
        )}
      </main>
    </div>
  );
}

export default App;