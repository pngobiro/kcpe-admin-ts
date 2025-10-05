import { useState } from 'react';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import '../styles/global.css';

interface QuizOption {
  option_letter: string;
  option_text: string;
  option_image?: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  question_image?: string;
  question_video?: string;
  question_audio?: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: QuizOption[];
  correct_answer?: string;
  explanation?: string;
  explanation_image?: string;
  explanation_video?: string;
  marks: number;
}

const QuizQuestionsDemo = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question_number: 1,
      question_text: 'What is the capital of Kenya?',
      question_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/320px-Flag_of_Kenya.svg.png',
      question_type: 'multiple_choice' as const,
      options: [
        { option_letter: 'A', option_text: 'Mombasa', is_correct: false },
        { option_letter: 'B', option_text: 'Nairobi', is_correct: true },
        { option_letter: 'C', option_text: 'Kisumu', is_correct: false },
        { option_letter: 'D', option_text: 'Nakuru', is_correct: false },
      ],
      explanation: 'Nairobi is the capital and largest city of Kenya.',
      marks: 1,
    },
  ]);

  const handleSave = () => {
    console.log('Questions to save:', questions);
    alert(`Saving ${questions.length} questions...\nCheck console for details.`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz_questions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Quiz Questions Manager Demo</h1>
          <p className="subtitle">
            Create and manage quiz questions with multimedia support
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExport} className="btn btn-secondary">
            📥 Export JSON
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            💾 Save Questions
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="info-box" style={{ marginBottom: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Features:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Add/Edit/Delete/Duplicate questions</li>
              <li>Support for multiple choice, true/false, and short answer questions</li>
              <li>Add images, videos, and audio to questions</li>
              <li>Add images to individual options</li>
              <li>Add multimedia explanations</li>
              <li>Inline previews with expandable modal view</li>
              <li>Drag and reorder questions (coming soon)</li>
            </ul>
          </div>

          <QuizQuestionsManager 
            questions={questions} 
            onChange={setQuestions}
          />
        </div>
      </div>

      {/* Usage Example */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-body">
          <h3>How to Use</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '6px', overflow: 'auto' }}>
{`import QuizQuestionsManager from '../components/QuizQuestionsManager';

function MyQuizPage() {
  const [questions, setQuestions] = useState([]);

  return (
    <QuizQuestionsManager 
      questions={questions} 
      onChange={setQuestions}
    />
  );
}`}
          </pre>

          <h3 style={{ marginTop: '20px' }}>Question Data Structure</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '6px', overflow: 'auto' }}>
{`{
  question_number: 1,
  question_text: "What is the capital of Kenya?",
  question_image: "https://example.com/image.jpg",
  question_video: "https://example.com/video.mp4",
  question_audio: "https://example.com/audio.mp3",
  question_type: "multiple_choice",
  options: [
    {
      option_letter: "A",
      option_text: "Mombasa",
      option_image: "https://example.com/option-a.jpg",
      is_correct: false
    },
    {
      option_letter: "B",
      option_text: "Nairobi",
      is_correct: true
    }
  ],
  explanation: "Nairobi is the capital...",
  explanation_image: "https://example.com/explanation.jpg",
  explanation_video: "https://example.com/explanation.mp4",
  marks: 1
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionsDemo;
