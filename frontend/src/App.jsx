import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateForm from './pages/CreateForm';
import Result from './pages/Result';
import KLineChart from './pages/KLineChart';
import KLineLoading from './pages/KLineLoading';
import KLineResult from './pages/KLineResult';
import FortuneBooksList from './pages/FortuneBooksList';
import LifeLineResultPage from './components/LifeLine/LifeLineResultPage';
import DivinationPage from './pages/DivinationPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateForm />} />
            <Route path="/result" element={<Result />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/divination" element={<DivinationPage />} />
            <Route path="/kline" element={<KLineChart />} />
            <Route path="/kline-loading" element={<KLineLoading />} />
            <Route path="/kline-result" element={<KLineResult />} />
            <Route path="/lifeline/result" element={<LifeLineResultPage />} />
            <Route path="/books" element={<FortuneBooksList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
