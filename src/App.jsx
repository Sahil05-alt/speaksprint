import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Challenge from './pages/Challenge';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function ThemedApp() {
    const { state } = useApp();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.theme);
    }, [state.theme]);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/challenge" element={<Challenge />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
            </Routes>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AppProvider>
            <ThemedApp />
        </AppProvider>
    );
}
