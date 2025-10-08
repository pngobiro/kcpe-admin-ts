import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CoursesPage from './pages/CoursesPage';
import SubjectsPage from './pages/SubjectsPage';
import Topics from './pages/Topics';
import TopicQuizzes from './pages/TopicQuizzes';
import QuizQuestionsUpload from './pages/QuizQuestionsUpload';
import PastPaperQuestionsUpload from './pages/PastPaperQuestionsUpload';
import ExamSetsPage from './pages/ExamSetsPage';
import PastPapersPage from './pages/PastPapersPage';
import QuestionsPage from './pages/QuestionsPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId/subjects" element={<SubjectsPage />} />
        <Route path="courses/:courseId/subjects/:subjectId/topics" element={<Topics />} />
        <Route path="topics/:topicId/quizzes" element={<TopicQuizzes />} />
        <Route path="quizzes/:quizId/questions" element={<QuizQuestionsUpload />} />
        <Route path="pastpapers/:pastPaperId/questions" element={<PastPaperQuestionsUpload />} />
        <Route path="topics" element={<Topics />} />
        <Route path="courses/:courseId/examsets" element={<ExamSetsPage />} />
        <Route path="examsets/:examSetId/pastpapers" element={<PastPapersPage />} />
        <Route path="subjects/:subjectId/pastpapers" element={<PastPapersPage />} />
        <Route path="examsets/:examSetId/questions" element={<QuestionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
