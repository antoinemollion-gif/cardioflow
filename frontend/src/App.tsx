import React, { useState } from 'react';
import './App.css';

interface Session {
    id: string;
    duration: number;
    coherenceScore: number;
    timestamp: string;
}

const App: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isTraining, setIsTraining] = useState(false);

    const startSession = () => {
        setIsTraining(true);
        // Simulate biofeedback session
        setTimeout(() => {
            const newSession: Session = {
                id: Math.random().toString(36).substr(2, 9),
                duration: 5,
                coherenceScore: Math.random() * 100,
                timestamp: new Date().toISOString()
            };
            setSessions([...sessions, newSession]);
            setIsTraining(false);
        }, 5000);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>CardioFlow</h1>
                <p>Heart Rate Variability Biofeedback Training</p>
            </header>
            <main>
                <button onClick={startSession} disabled={isTraining}>
                    {isTraining ? 'Training in progress...' : 'Start Session'}
                </button>
                <div className="sessions">
                    <h2>Recent Sessions</h2>
                    {sessions.length === 0 ? (
                        <p>No sessions yet</p>
                    ) : (
                        <ul>
                            {sessions.map(session => (
                                <li key={session.id}>
                                    <strong>Duration:</strong> {session.duration} mins | <strong>Coherence:</strong> {session.coherenceScore.toFixed(2)}%
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;