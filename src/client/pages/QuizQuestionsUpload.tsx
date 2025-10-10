import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import { getQuiz, saveQuizQuestions, getQuizQuestions } from '../api';
import '../styles/global.css';

// --- COMPREHENSIVE TYPESCRIPT INTERFACES FOR QUIZ QUESTIONS ---

type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'fill_in_blank'
  | 'short_essay'
  | 'matching'
  | 'ordering'
  | 'multiple_response';

interface Multimedia {
  image?: string;
  video?: string;
  audio?: string;
}

interface QuizOption {
  option_letter: string;
  option_text: string;
  option_image?: string;
  option_video?: string;
  option_audio?: string;
  is_correct: boolean;
  feedback?: string;
}

interface MatchingItem {
  item_number?: string;
  item_letter?: string;
  item_text: string;
  item_image?: string;
  correct_match?: string;
}

interface OrderingItem {
  item_id: string;
  item_text: string;
  item_image?: string;
  correct_position: number;
}

interface QuizQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  question_image?: string;
  question_video?: string;
  question_audio?: string;
  options?: QuizOption[];
  column_a?: MatchingItem[];
  column_b?: MatchingItem[];
  items?: OrderingItem[];
  correct_answer?: string;
  correct_answers?: string[];
  correct_order?: string;
  explanation?: string;
  marks: number;
  is_free?: boolean;
  difficulty_level?: string;
  time_allocation?: number;
  learning_objective?: string;
  // Metadata for reconstructing sections
  section_id?: string; 
}

interface QuizSection {
  section_id: string;
  section_name: string;
  section_description?: string;
  section_image?: string;
  section_video?: string;
  section_audio?: string;
  questions: QuizQuestion[];
}

interface Quiz {
  id: string;
  name: string;
  topic_id: string;
  quiz_type: string;
  questions_data_url?: string;
  is_published: boolean;
}

const QuizQuestionsUpload: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  // State to hold section metadata without questions
  const [sections, setSections] = useState<Omit<QuizSection, 'questions'>[]>([]); 
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
          console.log('Loading existing questions from API');
          try {
            const questionsResponse = await getQuizQuestions(quizId!);
            
            if (questionsResponse.data.success && questionsResponse.data.data) {
              const questionsData = questionsResponse.data.data;
              console.log('Successfully fetched questions from API:', questionsData);
              
              // Process the question data - expect full structure with sections
              if (questionsData.sections && Array.isArray(questionsData.sections)) {
                // Process nested format with sections
                const allQuestions: QuizQuestion[] = [];
                const sectionInfo: Omit<QuizSection, 'questions'>[] = [];

                questionsData.sections.forEach((section: any) => {
                  sectionInfo.push({
                    section_id: section.section_id,
                    section_name: section.section_name,
                    section_description: section.section_description,
                    section_image: section.section_image,
                    section_video: section.section_video,
                    section_audio: section.section_audio,
                  });
                  
                  if (section.questions && Array.isArray(section.questions)) {
                    section.questions.forEach((q: any) => {
                      allQuestions.push({
                        ...q,
                        id: q.id || `q_${Date.now()}_${allQuestions.length}`,
                        section_id: section.section_id, // Tag question with its section
                      });
                    });
                  }
                });
                
                setSections(sectionInfo);
                setQuestions(allQuestions);
              } else if (Array.isArray(questionsData)) {
                // Fallback: if it's a flat array, convert to sections format
                const sectionId = 'default_section';
                const sectionInfo = [{ section_id: sectionId, section_name: 'Main Section' }];
                const questionsWithSection = questionsData.map(q => ({ ...q, section_id: sectionId }));
                setSections(sectionInfo);
                setQuestions(questionsWithSection);
              } else {
                console.warn('Unexpected questions data format:', questionsData);
                initializeEmptyQuestions();
              }
            } else {
              throw new Error(questionsResponse.data.error || 'Failed to fetch questions');
            }
          } catch (fetchError) {
            console.error('Error fetching questions from API:', fetchError);
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
    const sectionId = 'default_section';
    setSections([{ section_id: sectionId, section_name: 'Main Section' }]);
    setQuestions([
      {
        id: `q_${Date.now()}`,
        question_number: 1,
        question_text: 'Enter your first question here...',
        question_type: 'multiple_choice',
        options: [{ option_letter: 'A', option_text: 'Option A', is_correct: true }],
        correct_answer: 'A',
        marks: 1,
        section_id: sectionId,
      },
    ]);
  };



  const handleSave = async () => {
    if (!quiz) return;
    
    setSaving(true);
    try {
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const estimatedTime = Math.round(questions.reduce((sum, q) => sum + (q.time_allocation || 60), 0) / 60);

      const fullQuizData = {
        title: quiz.name || `Quiz ${quiz.id}`,
        description: `Questions for ${quiz.name}`,
        paper_info: {
          paper_number: 1,
          paper_level: 'General',
          paper_type: 'quiz',
          total_questions: questions.length,
          total_marks: totalMarks,
          estimated_time_minutes: estimatedTime,
        },
        instructions: ["Answer ALL questions.", "Read each question carefully."],
        sections: sections.map(sectionInfo => ({
          ...sectionInfo,
          // Filter questions belonging to this section and strip the temporary section_id
          questions: questions
            .filter(q => q.section_id === sectionInfo.section_id)
            .map(({ section_id, ...restOfQuestion }) => restOfQuestion)
        }))
      };

      const response = await saveQuizQuestions(quiz.id, fullQuizData);
      if (response.data.success) {
        alert(`Successfully saved ${questions.length} questions across ${sections.length} sections.`);
      } else {
        throw new Error(response.data.error || 'Save failed due to a server error.');
      }
    } catch (err: any) {
      setError(`Failed to save questions: ${err.message}`);
      alert(`Failed to save questions: ${err.message}`);
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

  const handleDownloadTemplate = () => {
    // Uses the exact, comprehensive template provided by the user
    const templateData = {
      "title": "Comprehensive Quiz & Exam Template (with Full Multimedia Support)",
      "description": "The definitive universal template showcasing all supported question types and multimedia fields at every level (section, question, and option/item).",
      "paper_info": { "paper_number": 1, "paper_level": "General", "paper_type": "template", "subject_id": "mixed_subjects", "total_questions": 8, "total_marks": 50, "estimated_time_minutes": 15 },
      "instructions": [ "Answer ALL questions in this paper.", "Read each question carefully before answering.", "Some questions may include images, audio, or video for context." ],
      "sections": [
        { "section_id": "mcq", "section_name": "Section A: Multiple Choice Questions", "section_description": "Choose the single best answer for each question.", "section_image": "https://example.com/images/section_a_header.png", "questions": [
          { "id": "q001", "question_number": 1, "question_text": "Which of the following flags belongs to Japan?", "question_type": "multiple_choice", "options": [
            { "option_letter": "A", "option_text": "Flag A", "option_image": "https://example.com/images/flag_canada.png", "is_correct": false, "feedback": "This is the flag of Canada." },
            { "option_letter": "B", "option_text": "Flag B", "option_image": "https://example.com/images/flag_japan.png", "is_correct": true, "feedback": "Correct! This is the 'Hinomaru'." },
            { "option_letter": "C", "option_text": "Flag C", "option_image": "https://example.com/images/flag_brazil.png", "is_correct": false, "feedback": "This is the flag of Brazil." }
          ], "correct_answer": "B", "explanation": "The Japanese flag, known as the Hinomaru (Circle of the Sun), features a large red disc on a white background.", "marks": 5, "is_free": true, "difficulty_level": "beginner", "time_allocation": 60 }
        ]},
        { "section_id": "tf", "section_name": "Section B: True/False", "questions": [
          { "id": "q002", "question_number": 2, "question_text": "Listen to the audio clip. Is this the sound of a lion roaring?", "question_type": "true_false", "question_audio": "https://example.com/audio/tiger_growl.mp3", "options": [
            { "option_letter": "True", "option_text": "True", "is_correct": false }, { "option_letter": "False", "option_text": "False", "is_correct": true }
          ], "correct_answer": "False", "explanation": "The audio clip was the sound of a tiger, not a lion.", "marks": 5, "is_free": true, "time_allocation": 45 }
        ]},
        { "section_id": "sa", "section_name": "Section C: Short Answer", "questions": [
          { "id": "q003", "question_number": 3, "question_text": "What is the name of the landmark shown in the image?", "question_type": "short_answer", "question_image": "https://example.com/images/eiffel_tower.jpg", "correct_answer": "Eiffel Tower", "marks": 5, "is_free": true }
        ]},
        { "section_id": "fib", "section_name": "Section D: Fill in the Blank", "questions": [
          { "id": "q004", "question_number": 4, "question_text": "The largest planet in our solar system is ____.", "question_type": "fill_in_blank", "correct_answer": "Jupiter", "marks": 5 }
        ]},
        { "section_id": "essay", "section_name": "Section E: Short Essay", "questions": [
          { "id": "q005", "question_number": 5, "question_text": "Watch the video about the water cycle. Briefly explain evaporation.", "question_type": "short_essay", "question_video": "https://example.com/videos/water_cycle.mp4", "correct_answer": "Model Answer: Evaporation is the process where liquid water heats up, turns into a gas (water vapor), and rises into the atmosphere.", "marks": 10, "is_free": false, "difficulty_level": "intermediate", "time_allocation": 300 }
        ]},
        { "section_id": "match", "section_name": "Section F: Matching", "questions": [
          { "id": "q006", "question_number": 6, "question_text": "Match the artist to their painting.", "question_type": "matching", "column_a": [
            { "item_number": "1", "item_text": "Artist A", "item_image": "https://example.com/images/artist_da_vinci.jpg", "correct_match": "B" }, { "item_number": "2", "item_text": "Artist B", "item_image": "https://example.com/images/artist_van_gogh.jpg", "correct_match": "A" }
          ], "column_b": [
            { "item_letter": "A", "item_text": "The Starry Night", "item_image": "https://example.com/images/painting_starry_night.jpg" }, { "item_letter": "B", "item_text": "Mona Lisa", "item_image": "https://example.com/images/painting_mona_lisa.jpg" }
          ], "marks": 5, "difficulty_level": "intermediate" }
        ]},
        { "section_id": "order", "section_name": "Section G: Ordering", "questions": [
          { "id": "q007", "question_number": 7, "question_text": "Arrange the butterfly life cycle images in order.", "question_type": "ordering", "items": [
            { "item_id": "pupa", "item_text": "Pupa", "item_image": "https://example.com/images/lifecycle_pupa.png", "correct_position": 3 }, { "item_id": "adult", "item_text": "Butterfly", "item_image": "https://example.com/images/lifecycle_butterfly.png", "correct_position": 4 },
            { "item_id": "egg", "item_text": "Eggs", "item_image": "https://example.com/images/lifecycle_eggs.png", "correct_position": 1 }, { "item_id": "larva", "item_text": "Caterpillar", "item_image": "https://example.com/images/lifecycle_caterpillar.png", "correct_position": 2 }
          ], "correct_order": "egg, larva, pupa, adult", "marks": 5 }
        ]},
        { "section_id": "mr", "section_name": "Section H: Multiple Response", "questions": [
          { "id": "q008", "question_number": 8, "question_text": "Select ALL images that show a percussion instrument.", "question_type": "multiple_response", "options": [
            { "option_letter": "A", "option_text": "Drums", "option_image": "https://example.com/images/instrument_drums.jpg", "is_correct": true }, { "option_letter": "B", "option_text": "Flute", "option_image": "https://example.com/images/instrument_flute.jpg", "is_correct": false },
            { "option_letter": "C", "option_text": "Xylophone", "option_image": "https://example.com/images/instrument_xylophone.jpg", "is_correct": true }, { "option_letter": "D", "option_text": "Violin", "option_image": "https://example.com/images/instrument_violin.jpg", "is_correct": false }
          ], "correct_answers": ["A", "C"], "marks": 5 }
        ]}
      ]
    };

    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'full_quiz_template_with_multimedia.json';
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

        // Validate the imported data structure - support nested format with sections
        let isValidFormat = false;
        let questionsArray = [];
        let sectionsArray = [];

        // Support nested format with sections (preferred)
        if (jsonData.sections && Array.isArray(jsonData.sections)) {
          // Extract questions from all sections
          questionsArray = jsonData.sections.flatMap((section: any) =>
            section.questions ? section.questions.map((q: any) => ({ ...q, section_id: section.section_id })) : []
          );
          sectionsArray = jsonData.sections.map((section: any) => ({
            section_id: section.section_id,
            section_name: section.section_name,
            section_description: section.section_description,
            section_image: section.section_image,
            section_video: section.section_video,
            section_audio: section.section_audio,
          }));
          isValidFormat = questionsArray.length > 0;
        }

        if (isValidFormat) {
          // Process the imported questions and sections
          setSections(sectionsArray);
          setQuestions(questionsArray);

          // Automatically save to R2 after successful import
          if (quiz) {
            try {
              setSaving(true);
              const { uploadQuizData } = await import('../api');
              const response = await uploadQuizData(quiz.id, { sections: jsonData.sections });

              if (response.data.success) {
                alert(`Successfully imported and saved ${questionsArray.length} questions across ${sectionsArray.length} sections to R2 storage!\nR2 Key: ${response.data.data.r2Key}`);
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
            alert(`Successfully imported ${questionsArray.length} questions across ${sectionsArray.length} sections!`);
          }
        } else {
          alert('Invalid file format. Please use the correct JSON format with:\n• A "sections" array where each section contains a "questions" array\n• See questions_types.json for the complete template structure');
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
          <button onClick={handleDownloadTemplate} className="btn btn-info">
            📋 Download Template
          </button>
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
            <strong style={{ color: '#667eea' }}>Free Questions:</strong> 
            <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>
              {questions.filter(q => q.is_free === true).length}
            </span>
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Paid Questions:</strong> 
            <span style={{ color: '#e67e22', marginLeft: '0.5rem' }}>
              {questions.filter(q => q.is_free === false).length}
            </span>
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Total Marks:</strong> 
            {questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Est. Duration:</strong> 
            {questions.reduce((sum, q) => sum + (q.time_allocation || 2), 0)} min
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
          {quiz?.questions_data_url && (
            <div>
              <strong style={{ color: '#667eea' }}>Data Source:</strong> 
              <a 
                href={quiz.questions_data_url} 
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
        {/* Difficulty Distribution */}
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #e1e8ed' 
        }}>
          <strong style={{ color: '#667eea', marginBottom: '0.5rem', display: 'block' }}>
            Difficulty Distribution:
          </strong>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#27ae60' }}>●</span> 
              <strong>Beginner:</strong> {questions.filter(q => q.difficulty_level === 'BEGINNER').length}
            </div>
            <div>
              <span style={{ color: '#f39c12' }}>●</span> 
              <strong>Intermediate:</strong> {questions.filter(q => q.difficulty_level === 'INTERMEDIATE').length}
            </div>
            <div>
              <span style={{ color: '#e74c3c' }}>●</span> 
              <strong>Advanced:</strong> {questions.filter(q => q.difficulty_level === 'ADVANCED').length}
            </div>
          </div>
        </div>
      </div>

      <QuizQuestionsManager 
        questions={questions} 
        onChange={setQuestions}
        sections={sections}
        onSectionsChange={setSections}
      />
    </div>
  );
};

export default QuizQuestionsUpload;
