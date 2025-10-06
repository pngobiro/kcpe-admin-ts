import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import { getQuiz } from '../api';
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
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank';
  options: QuizOption[];
  correct_answer?: string;
  explanation?: string;
  explanation_image?: string;
  explanation_video?: string;
  marks: number;
}

interface Quiz {
  id: string;
  name: string;
  topic_id: string;
  quiz_type: string;
  quiz_data_url?: string;
  is_published: boolean;
}

const QuizQuestionsUpload: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // Fetch the actual quiz data
      console.log('Fetching quiz data for ID:', quizId);
      const quizResponse = await getQuiz(quizId!);
      
      if (quizResponse.data.success && quizResponse.data.data) {
        const quizData = quizResponse.data.data;
        setQuiz(quizData);
        
        // If the quiz has a data URL, fetch the existing questions
        if (quizData.quiz_data_url) {
          console.log('Loading existing questions from:', quizData.quiz_data_url);
          try {
            console.log('Fetching questions from URL:', quizData.quiz_data_url);
            
            // Try to fetch through our proxy first to handle authentication
            let questionsResponse: Response;
            let questionsData: any;
            
            try {
              console.log('Attempting to fetch via proxy...');
              questionsResponse = await fetch(`/api/quiz-data/proxy?url=${encodeURIComponent(quizData.quiz_data_url)}`);
              
              if (questionsResponse.ok) {
                const proxyData = await questionsResponse.json();
                if (proxyData.success) {
                  questionsData = proxyData.data;
                  console.log('Successfully fetched via proxy');
                } else {
                  throw new Error(proxyData.error || 'Proxy fetch failed');
                }
              } else {
                throw new Error(`Proxy returned ${questionsResponse.status}`);
              }
            } catch (proxyError) {
              console.warn('Proxy fetch failed, trying direct fetch:', proxyError);
              
              // Fallback to direct fetch
              questionsResponse = await fetch(quizData.quiz_data_url);
              
              if (!questionsResponse.ok) {
                if (questionsResponse.status === 401) {
                  throw new Error('Authentication required - Quiz data is protected. The quiz data URL requires API authentication. Please contact your administrator or use the upload functionality to add questions manually.');
                }
                throw new Error(`Failed to fetch quiz data: ${questionsResponse.status} ${questionsResponse.statusText}`);
              }
              
              questionsData = await questionsResponse.json();
            }
            
            // Check for API error responses
            if (questionsData.success === false && questionsData.error) {
              throw new Error(`API Error: ${questionsData.error}`);
            }
            
            // Process the question data
            processQuestionData(questionsData);
          } catch (fetchError) {
            console.error('Error fetching questions from URL:', fetchError);
            // Show user-friendly error message
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load existing quiz questions');
            initializeEmptyQuestions();
          }
        } else {
          // No data URL, start with empty template
          initializeEmptyQuestions();
        }
      } else {
        throw new Error('Failed to load quiz data');
      }
    } catch (err) {
      setError('Failed to load quiz data');
      console.error('Error fetching quiz:', err);
      // Still initialize with empty question if quiz fetch fails
      initializeEmptyQuestions();
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyQuestions = () => {
    setQuestions([
      {
        question_number: 1,
        question_text: 'Enter your question here...',
        question_type: 'multiple_choice' as const,
        options: [
          { option_letter: 'A', option_text: '', is_correct: false },
          { option_letter: 'B', option_text: '', is_correct: false },
          { option_letter: 'C', option_text: '', is_correct: false },
          { option_letter: 'D', option_text: '', is_correct: false },
        ],
        marks: 1,
      },
    ]);
  };

  const processQuestionData = (questionsData: any) => {
    console.log('Processing question data:', questionsData);
    
    // Handle different possible JSON structures
    let questionsArray = [];
    if (Array.isArray(questionsData)) {
      questionsArray = questionsData;
    } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
      questionsArray = questionsData.questions;
    } else if (questionsData.data && questionsData.data.questions && Array.isArray(questionsData.data.questions)) {
      // Handle Cloudflare worker response format: { success: true, data: { questions: [...] } }
      questionsArray = questionsData.data.questions;
    } else if (questionsData.data && Array.isArray(questionsData.data)) {
      questionsArray = questionsData.data;
    }
    
    console.log('Found questions array:', questionsArray.length, 'questions');
    
    if (questionsArray.length > 0) {
      // Validate and normalize the questions structure
      const normalizedQuestions = questionsArray.map((q: any, index: number) => {
        // Handle Cloudflare API format vs standard format
        const questionType = q.type === 'MULTIPLE_CHOICE' ? 'multiple_choice' : 
                           q.type === 'TRUE_FALSE' ? 'true_false' : 
                           q.type === 'FILL_IN_THE_BLANK' ? 'fill_in_blank' :
                           q.question_type || 'multiple_choice';
        
        let options = [];
        if (q.options && Array.isArray(q.options)) {
          // Cloudflare API format
          options = q.options.map((opt: any, optIndex: number) => ({
            option_letter: opt.name || opt.option_letter || String.fromCharCode(65 + optIndex),
            option_text: opt.optionText || opt.option_text || opt.text || '',
            option_image: opt.optionImage || opt.option_image || opt.image || undefined,
            is_correct: opt.isCorrectAnswer || opt.is_correct || opt.correct || false
          }));
        } else if (q.type === 'TRUE_FALSE') {
          // True/False question
          options = [
            { option_letter: 'A', option_text: 'True', is_correct: q.isCorrectAnswer === true },
            { option_letter: 'B', option_text: 'False', is_correct: q.isCorrectAnswer === false },
          ];
        } else {
          // Default empty options
          options = [
            { option_letter: 'A', option_text: '', is_correct: false },
            { option_letter: 'B', option_text: '', is_correct: false },
            { option_letter: 'C', option_text: '', is_correct: false },
            { option_letter: 'D', option_text: '', is_correct: false },
          ];
        }

        return {
          id: q.id || undefined,
          question_number: q.number || q.question_number || index + 1,
          question_text: q.questionText || q.quizText || q.question_text || q.question || '',
          question_image: q.questionImage || q.quizImage || q.question_image || q.image || undefined,
          question_video: q.questionVideo || q.quizVideo || q.question_video || q.video || undefined,
          question_audio: q.questionAudio || q.quizAudio || q.question_audio || q.audio || undefined,
          question_type: questionType,
          options: options,
          correct_answer: q.correctAnswer || q.correct_answer || q.answer || undefined,
          explanation: q.explanation || undefined,
          explanation_image: q.explanation_image || undefined,
          explanation_video: q.explanation_video || undefined,
          marks: q.marks || q.points || 1,
        };
      });
      
      setQuestions(normalizedQuestions);
      console.log(`Loaded ${normalizedQuestions.length} existing questions:`, normalizedQuestions);
    } else {
      console.log('No questions found, initializing empty template');
      // No questions found, start with empty template
      initializeEmptyQuestions();
    }
  };

  const handleSave = async () => {
    if (!quiz) return;
    
    try {
      setSaving(true);
      
      // Prepare the data for API submission with R2 format
      const quizData = {
        examSetId: `examset_${new Date().getFullYear()}_${quiz.topic_id}`,
        examSetName: `${new Date().getFullYear()} Quiz Data`,
        subjectId: quiz.topic_id,
        year: new Date().getFullYear(),
        questions: questions.map((q, index) => {
          // Convert frontend format to Cloudflare API format
          if (q.question_type === 'multiple_choice') {
            return {
              number: q.question_number || index + 1,
              type: 'MULTIPLE_CHOICE',
              questionText: q.question_text,
              questionImage: q.question_image || '',
              questionPdf: '',
              solutionText: q.explanation || '',
              solutionImage: q.explanation_image || '',
              solutionPdf: '',
              solutionVideo: q.explanation_video || '',
              solutionUrl: '',
              part: 1,
              paperLevel: q.marks || 1,
              isFree: true,
              hasParts: false,
              options: q.options.map((opt, optIndex) => ({
                order: optIndex + 1,
                name: opt.option_letter,
                optionText: opt.option_text,
                optionImage: opt.option_image || '',
                explanation: opt.is_correct ? 'Correct answer' : 'Incorrect answer',
                isCorrectAnswer: opt.is_correct
              }))
            };
          } else if (q.question_type === 'true_false') {
            return {
              number: q.question_number || index + 1,
              type: 'TRUE_FALSE',
              questionText: q.question_text,
              questionImage: q.question_image || '',
              questionPdf: '',
              solutionText: q.explanation || '',
              solutionImage: q.explanation_image || '',
              solutionPdf: '',
              solutionVideo: q.explanation_video || '',
              solutionUrl: '',
              part: 1,
              paperLevel: q.marks || 1,
              isFree: true,
              hasParts: false,
              isCorrectAnswer: q.options?.[0]?.is_correct || false
            };
          } else if (q.question_type === 'fill_in_blank') {
            return {
              number: q.question_number || index + 1,
              type: 'FILL_IN_THE_BLANK',
              questionText: q.question_text,
              questionImage: q.question_image || '',
              questionPdf: '',
              solutionText: q.correct_answer || q.explanation || '',
              solutionImage: q.explanation_image || '',
              solutionPdf: '',
              solutionVideo: q.explanation_video || '',
              solutionUrl: '',
              part: 1,
              paperLevel: q.marks || 1,
              isFree: true,
              hasParts: false,
              correctAnswer: q.correct_answer || ''
            };
          } else {
            // Default to multiple choice format
            return {
              number: q.question_number || index + 1,
              type: 'MULTIPLE_CHOICE',
              questionText: q.question_text,
              questionImage: q.question_image || '',
              questionPdf: '',
              solutionText: q.explanation || '',
              solutionImage: q.explanation_image || '',
              solutionPdf: '',
              solutionVideo: q.explanation_video || '',
              solutionUrl: '',
              part: 1,
              paperLevel: q.marks || 1,
              isFree: true,
              hasParts: false,
              options: q.options.map((opt, optIndex) => ({
                order: optIndex + 1,
                name: opt.option_letter,
                optionText: opt.option_text,
                optionImage: opt.option_image || '',
                explanation: opt.is_correct ? 'Correct answer' : 'Incorrect answer',
                isCorrectAnswer: opt.is_correct
              }))
            };
          }
        })
      };

      console.log('Uploading quiz data to R2:', quizData);
      
      // Import the uploadQuizData function
      const { uploadQuizData } = await import('../api');
      const response = await uploadQuizData(quiz.id, quizData);
      
      if (response.data.success) {
        alert(`Successfully saved ${questions.length} questions to R2 storage for ${quiz.name}!\nR2 Key: ${response.data.data.r2Key}`);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
      
    } catch (err: any) {
      console.error('Error saving questions:', err);
      alert(`Failed to save questions: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!quiz) return;
    
    const exportData = {
      quiz_id: quiz.id,
      quiz_name: quiz.name,
      topic_id: quiz.topic_id,
      questions: questions,
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.name.replace(/\s+/g, '_').toLowerCase()}_questions.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (jsonData.questions && Array.isArray(jsonData.questions)) {
          // Process the imported questions
          processQuestionData(jsonData);
          
          // Automatically save to R2 after successful import
          if (quiz) {
            try {
              setSaving(true);
              const { uploadQuizData } = await import('../api');
              const response = await uploadQuizData(quiz.id, jsonData);
              
              if (response.data.success) {
                alert(`Successfully imported and saved ${jsonData.questions.length} questions to R2 storage!\nR2 Key: ${response.data.data.r2Key}`);
              } else {
                alert(`Questions imported locally but failed to save to R2: ${response.data.error}`);
              }
            } catch (uploadError: any) {
              console.error('Upload error:', uploadError);
              alert(`Questions imported locally but failed to save to R2: ${uploadError.message}`);
            } finally {
              setSaving(false);
            }
          } else {
            alert(`Successfully imported ${jsonData.questions.length} questions!`);
          }
        } else {
          alert('Invalid file format. Please ensure the JSON contains a "questions" array.');
        }
      } catch (err) {
        console.error('Error parsing JSON:', err);
        alert('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Loading quiz data...
        </div>
        <div style={{ 
          color: '#6b7280', 
          fontSize: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <div>📋 Fetching quiz details</div>
          <div>🔍 Checking for existing questions</div>
          <div>⚡ Preparing editor</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
                {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #f87171',
            color: '#dc2626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <strong>Error Loading Quiz Data</strong>
            </div>
            <p style={{ margin: 0, lineHeight: '1.5' }}>{error}</p>
            {error.includes('Authentication required') && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.7)', 
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <strong>💡 What you can do:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                  <li>Use the upload functionality below to add questions manually</li>
                  <li>Import questions from a JSON file using the "Import JSON" button</li>
                  <li>Contact your administrator about accessing the quiz data URL</li>
                </ul>
              </div>
            )}
          </div>
        )}
        <button onClick={goBack} className="btn btn-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '0.5rem' 
          }}>
            <button 
              onClick={goBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#667eea',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ←
            </button>
            <h1 style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Quiz Questions Upload
            </h1>
          </div>
          <p className="subtitle">
            Upload and manage questions for: <strong>{quiz?.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            📥 Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={handleExport} className="btn btn-secondary">
            📤 Export JSON
          </button>
          <button 
            onClick={handleSave} 
            className="btn btn-primary"
            disabled={saving}
            style={{
              background: saving 
                ? '#ccc' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save Questions'}
          </button>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e1e8ed'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ color: '#667eea' }}>Quiz ID:</strong> {quiz?.id}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Quiz Name:</strong> {quiz?.name}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Topic ID:</strong> {quiz?.topic_id}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Questions:</strong> {questions.length}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Status:</strong> 
            <span style={{ 
              color: quiz?.is_published ? '#27ae60' : '#e67e22',
              marginLeft: '0.5rem'
            }}>
              {quiz?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          {quiz?.quiz_data_url && (
            <div>
              <strong style={{ color: '#667eea' }}>Data Source:</strong> 
              <a 
                href={quiz.quiz_data_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#3b82f6', 
                  marginLeft: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                📄 View JSON
              </a>
            </div>
          )}
        </div>
      </div>

      <QuizQuestionsManager 
        questions={questions} 
        onChange={setQuestions} 
      />
    </div>
  );
};

export default QuizQuestionsUpload;
