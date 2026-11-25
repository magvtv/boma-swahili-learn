import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CommunityPage } from './features/community/CommunityPage';
import { FlashcardsPage } from './features/flashcards/FlashcardsPage';
import { GrammarPage } from './features/grammar/GrammarPage';
import { PhrasebookPage } from './features/phrasebook/PhrasebookPage';
import { QuizzesPage } from './features/quizzes/QuizzesPage';
import { TranslatorPage } from './features/translator/TranslatorPage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="translator" element={<TranslatorPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="phrasebook" element={<PhrasebookPage />} />
          <Route path="grammar" element={<GrammarPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
