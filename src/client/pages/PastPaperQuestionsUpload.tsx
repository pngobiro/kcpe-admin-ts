import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import { getPastPaper, getPastPaperQuestions, savePastPaperQuestions } from '../api';
import type { PastPaper } from '../types';
import '../styles/global.css';

interface PastPaperOption {
  option_letter: string;
  option_text: string;
  option_image?: string;
  is_correct: boolean;
}

interface PastPaperQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  question_image?: string;
  question_video?: string;
  question_audio?: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank';
  options: PastPaperOption[];
  correct_answer?: string;
  explanation?: string;
  explanation_image?: string;
  explanation_video?: string;
  marks: number;
  
  // Enhanced fields for past papers
  question_id?: string;
  version?: string;
  is_free?: boolean;
  part?: string;
  main_question?: number;
  sub_question?: string;
  has_sub_questions?: boolean;
  difficulty_level?: string;
  time_allocation?: number;
  learning_objective?: string;
  last_modified?: string;
  change_log?: string;
}

const PastPaperQuestionsUpload: React.FC = () => {
  const { pastPaperId } = useParams<{ pastPaperId: string }>();
  const navigate = useNavigate();
  const [pastPaper, setPastPaper] = useState<PastPaper | null>(null);
  const [questions, setQuestions] = useState<PastPaperQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pastPaperId) {
      fetchPastPaperData();
    }
  }, [pastPaperId]);

  const fetchPastPaperData = async () => {
    try {
      setLoading(true);
      
      // Fetch the past paper details
      console.log('Fetching past paper data for ID:', pastPaperId);
      const pastPaperResponse = await getPastPaper(pastPaperId!);
      
      if (pastPaperResponse.data.success && pastPaperResponse.data.data) {
        const pastPaperData = pastPaperResponse.data.data;
        setPastPaper(pastPaperData);
        
        // If the past paper has questions data, fetch existing questions
        if (pastPaperData.questions_data_url) {
          console.log('Loading existing questions from:', pastPaperData.questions_data_url);
          try {
            const questionsResponse = await getPastPaperQuestions(pastPaperId!);
            
            if (questionsResponse.data.success && questionsResponse.data.data) {
              processQuestionData(questionsResponse.data.data);
            } else {
              console.log('No existing questions found');
              initializeEmptyQuestions();
            }
          } catch (fetchError) {
            console.error('Error fetching questions:', fetchError);
            setError('Failed to load existing questions. You can still add new questions.');
            initializeEmptyQuestions();
          }
        } else {
          // No questions data URL, start with empty template
          initializeEmptyQuestions();
        }
      } else {
        throw new Error('Failed to load past paper data');
      }
    } catch (err) {
      setError('Failed to load past paper data');
      console.error('Error fetching past paper:', err);
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
        
        // Enhanced default fields for past papers
        question_id: 'pp_q_1',
        version: '1.0',
        is_free: false, // Past papers are typically paid content
        part: undefined,
        main_question: 1,
        sub_question: undefined,
        has_sub_questions: false,
        difficulty_level: 'INTERMEDIATE',
        time_allocation: 2,
        learning_objective: '',
        last_modified: new Date().toISOString().split('T')[0],
        change_log: 'Initial creation'
      },
    ]);
  };

  const processQuestionData = (questionsData: any) => {
    console.log('Processing past paper question data:', questionsData);
    
    // Handle different possible JSON structures
    let questionsArray = [];
    if (Array.isArray(questionsData)) {
      questionsArray = questionsData;
    } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
      questionsArray = questionsData.questions;
    } else if (questionsData.data && questionsData.data.questions && Array.isArray(questionsData.data.questions)) {
      questionsArray = questionsData.data.questions;
    } else if (questionsData.data && Array.isArray(questionsData.data)) {
      questionsArray = questionsData.data;
    }
    
    console.log('Found questions array:', questionsArray.length, 'questions');
    
    if (questionsArray.length > 0) {
      // Normalize the questions structure for past papers
      const normalizedQuestions = questionsArray.map((q: any, index: number) => {
        const questionType = q.type === 'MULTIPLE_CHOICE' ? 'multiple_choice' : 
                           q.type === 'TRUE_FALSE' ? 'true_false' : 
                           q.type === 'FILL_IN_BLANK' || q.type === 'FILL_IN_THE_BLANK' ? 'fill_in_blank' :
                           q.question_type || 'multiple_choice';
        
        let options = [];
        let correctAnswer = q.correctAnswer || q.correct_answer || q.answer || undefined;

        if (q.options && Array.isArray(q.options)) {
          options = q.options.map((opt: any, optIndex: number) => ({
            option_letter: opt.name || opt.option_letter || String.fromCharCode(65 + optIndex),
            option_text: opt.optionText || opt.option_text || opt.text || '',
            option_image: opt.optionImage || opt.option_image || opt.image || undefined,
            is_correct: opt.isCorrectAnswer || opt.is_correct || opt.correct || false
          }));

          if (questionType === 'fill_in_blank' && options.length > 0) {
            const correctOption = options.find((opt: any) => opt.is_correct);
            if (correctOption) {
              correctAnswer = correctOption.option_text;
            }
          }
        } else if (q.type === 'TRUE_FALSE') {
          if (q.isCorrectAnswer !== undefined) {
            options = [
              { option_letter: 'True', option_text: 'True', is_correct: q.isCorrectAnswer === true },
              { option_letter: 'False', option_text: 'False', is_correct: q.isCorrectAnswer === false },
            ];
          } else {
            options = [
              { option_letter: 'True', option_text: 'True', is_correct: false },
              { option_letter: 'False', option_text: 'False', is_correct: false },
            ];
          }
        } else if (questionType === 'fill_in_blank') {
          options = [];
        } else {
          options = [
            { option_letter: 'A', option_text: '', is_correct: false },
            { option_letter: 'B', option_text: '', is_correct: false },
            { option_letter: 'C', option_text: '', is_correct: false },
            { option_letter: 'D', option_text: '', is_correct: false },
          ];
        }

        return {
          id: q.id || q.questionId || undefined,
          question_number: q.number || q.question_number || index + 1,
          question_text: q.questionText || q.quizText || q.question_text || q.question || '',
          question_image: q.questionImage || q.quizImage || q.question_image || q.image || undefined,
          question_video: q.questionVideo || q.quizVideo || q.question_video || q.video || undefined,
          question_audio: q.questionAudio || q.quizAudio || q.question_audio || q.audio || undefined,
          question_type: questionType,
          options: options,
          correct_answer: correctAnswer,
          explanation: q.explanation || q.solutionText || undefined,
          explanation_image: q.explanation_image || undefined,
          explanation_video: q.explanation_video || undefined,
          marks: q.marks || q.points || q.paperLevel || 1,
          
          // Enhanced fields for past papers
          question_id: q.questionId || `pp_q_${index + 1}`,
          version: q.questionVersion || q.version || "1.0",
          is_free: q.isFree !== undefined ? q.isFree : (q.is_free !== undefined ? q.is_free : false),
          part: q.part || q.questionPart || undefined,
          main_question: q.mainQuestion || q.main_question || (q.number || index + 1),
          sub_question: q.subQuestion || q.sub_question || undefined,
          has_sub_questions: q.hasSubQuestions || q.has_sub_questions || false,
          difficulty_level: q.difficultyLevel || q.difficulty_level || q.difficulty || 'INTERMEDIATE',
          time_allocation: q.timeAllocation || q.time_allocation || q.estimatedTime || 2,
          learning_objective: q.learningObjective || q.learning_objective || q.objective || undefined,
          last_modified: q.lastModified || q.last_modified || new Date().toISOString().split('T')[0],
          change_log: q.changeLog || q.change_log || undefined
        };
      });
      
      setQuestions(normalizedQuestions);
      console.log(`Loaded ${normalizedQuestions.length} existing past paper questions:`, normalizedQuestions);
    } else {
      console.log('No questions found, initializing empty template');
      initializeEmptyQuestions();
    }
  };

  const handleSave = async () => {
    if (!pastPaper) return;
    
    try {
      setSaving(true);
      
      // Prepare the data for past paper questions storage
      const questionsData = {
        // Past paper metadata
        title: `${pastPaper.subject_id || 'Subject'} - Paper ${pastPaper.paper_number} Level ${pastPaper.paper_level}`,
        description: `Past paper questions for ${pastPaper.paper_type || 'main'} examination`,
        paper_info: {
          past_paper_id: pastPaper.id,
          paper_number: pastPaper.paper_number,
          paper_level: pastPaper.paper_level,
          paper_type: pastPaper.paper_type,
          subject_id: pastPaper.subject_id,
          exam_set_id: pastPaper.exam_set_id,
          year: pastPaper.year,
          duration_minutes: 120, // Default duration
          total_marks: questions.reduce((sum, q) => sum + (q.marks || 1), 0)
        },
        instructions: [
          "Answer ALL questions in this paper",
          "Write your answers in the spaces provided",
          "Candidates should check the question paper to ascertain that all pages are printed as indicated",
          "All working MUST be clearly shown where necessary"
        ],
        
        // Questions data
        questions: questions.map((q, index) => ({
          id: q.question_number || index + 1,
          question: q.question_text,
          question_type: q.question_type,
          marks: q.marks || 1,
          options: q.options.map(opt => opt.option_text),
          correct_answer: q.question_type === 'multiple_choice' 
            ? q.options.findIndex(opt => opt.is_correct)
            : q.correct_answer,
          explanation: q.explanation || '',
          learning_objective: q.learning_objective || '',
          difficulty: q.difficulty_level || 'medium'
        })),
        
        // Metadata
        sections: [
          {
            section_name: "Section A: Multiple Choice Questions",
            section_description: "Choose the best answer for each question",
            question_ids: questions.map((_, index) => index + 1),
            marks: questions.reduce((sum, q) => sum + (q.marks || 1), 0)
          }
        ],
        total_questions: questions.length,
        total_marks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        estimated_duration: questions.reduce((sum, q) => sum + (q.time_allocation || 2), 0),
        
        // Access control
        is_free: pastPaper.is_free || false,
        is_published: pastPaper.is_published || false,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving past paper questions data to R2:', questionsData);
      
      const response = await savePastPaperQuestions(pastPaper.id, questionsData);
      
      if (response.data.success) {
        const freeCount = questions.filter(q => q.is_free === true).length;
        const paidCount = questions.filter(q => q.is_free === false).length;
        
        alert(`Successfully saved ${questions.length} questions to R2 storage for Past Paper!\n\nBreakdown:\n• Free questions: ${freeCount}\n• Paid questions: ${paidCount}\n• Total marks: ${questionsData.total_marks}\n• Estimated duration: ${questionsData.estimated_duration} minutes\n\nQuestions Data URL: ${response.data.data.questions_data_url}`);
      } else {
        throw new Error(response.data.error || 'Save failed');
      }
      
    } catch (err: any) {
      console.error('Error saving past paper questions:', err);
      alert(`Failed to save questions: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!pastPaper) return;
    
    const exportData = {
      past_paper_id: pastPaper.id,
      past_paper_name: `Paper ${pastPaper.paper_number} Level ${pastPaper.paper_level}`,
      subject_id: pastPaper.subject_id,
      exam_set_id: pastPaper.exam_set_id,
      paper_info: {
        paper_number: pastPaper.paper_number,
        paper_level: pastPaper.paper_level,
        paper_type: pastPaper.paper_type,
        year: pastPaper.year
      },
      questions: questions,
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `past_paper_${pastPaper.id}_questions.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const templateData = {
      title: "Biology Grade 10 - Term 1 Past Paper",
      description: "Past paper questions for Biology Grade 10 Term 1 examination",
      paper_info: {
        paper_number: 1,
        paper_level: 1,
        paper_type: "main",
        duration_minutes: 120,
        total_marks: 100
      },
      instructions: [
        "Answer ALL questions in this paper",
        "Write your answers in the spaces provided",
        "Candidates should check the question paper to ascertain that all pages are printed as indicated",
        "All working MUST be clearly shown where necessary"
      ],
      questions: [
        {
          id: 1,
          question: "Which of the following is NOT a characteristic of living organisms?",
          question_type: "multiple_choice",
          marks: 1,
          options: [
            "Growth and development",
            "Response to stimuli", 
            "Reproduction",
            "Uniform composition"
          ],
          correct_answer: 3,
          explanation: "Living organisms do not have uniform composition; they are made up of various different molecules and structures.",
          learning_objective: "Identify characteristics of living organisms",
          difficulty: "easy"
        },
        {
          id: 2,
          question: "The basic unit of life is:",
          question_type: "multiple_choice",
          marks: 1,
          options: [
            "Atom",
            "Molecule",
            "Cell",
            "Tissue"
          ],
          correct_answer: 2,
          explanation: "The cell is considered the basic unit of life as it is the smallest structural and functional unit of living organisms.",
          learning_objective: "Understand cell theory",
          difficulty: "easy"
        }
      ],
      sections: [
        {
          section_name: "Section A: Multiple Choice Questions",
          section_description: "Choose the best answer for each question",
          question_ids: [1, 2],
          marks: 2
        }
      ],
      total_questions: 2,
      total_marks: 2,
      estimated_duration: 4
    };

    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'past_paper_questions_template.json';
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
          if (pastPaper) {
            try {
              setSaving(true);
              const response = await savePastPaperQuestions(pastPaper.id, jsonData);
              
              if (response.data.success) {
                alert(`Successfully imported and saved ${jsonData.questions.length} questions to R2 storage!\nQuestions Data URL: ${response.data.data.questions_data_url}`);
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
          Loading past paper data...
        </div>
        <div style={{ 
          color: '#6b7280', 
          fontSize: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <div>📋 Fetching past paper details</div>
          <div>🔍 Checking for existing questions</div>
          <div>⚡ Preparing editor</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
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
            <strong>Error Loading Past Paper Data</strong>
          </div>
          <p style={{ margin: 0, lineHeight: '1.5' }}>{error}</p>
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
              <li>Download the template to see the expected format</li>
            </ul>
          </div>
        </div>
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
              Past Paper Questions Upload
            </h1>
          </div>
          <p className="subtitle">
            Upload and manage questions for: <strong>Paper {pastPaper?.paper_number} Level {pastPaper?.paper_level}</strong>
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
            <strong style={{ color: '#667eea' }}>Past Paper ID:</strong> {pastPaper?.id}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Subject:</strong> {pastPaper?.subject_id}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Exam Set:</strong> {pastPaper?.exam_set_id}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Paper:</strong> {pastPaper?.paper_number} - Level {pastPaper?.paper_level}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Type:</strong> {pastPaper?.paper_type}
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Year:</strong> {pastPaper?.year || 'N/A'}
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
              color: pastPaper?.is_published ? '#27ae60' : '#e67e22',
              marginLeft: '0.5rem'
            }}>
              {pastPaper?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#667eea' }}>Access:</strong> 
            <span style={{ 
              color: pastPaper?.is_free ? '#27ae60' : '#e67e22',
              marginLeft: '0.5rem'
            }}>
              {pastPaper?.is_free ? 'Free' : 'Paid'}
            </span>
          </div>
          {pastPaper?.questions_data_url && (
            <div>
              <strong style={{ color: '#667eea' }}>Data Source:</strong> 
              <a 
                href={pastPaper.questions_data_url} 
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
        
        {/* Question Parts Summary */}
        {questions.some(q => q.part || q.has_sub_questions) && (
          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #e1e8ed' 
          }}>
            <strong style={{ color: '#667eea', marginBottom: '0.5rem', display: 'block' }}>
              Question Parts Structure:
            </strong>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <div>
                <strong>Main Questions:</strong> {questions.filter(q => !q.part).length}
              </div>
              <div>
                <strong>Sub-parts:</strong> {questions.filter(q => q.part).length}
              </div>
              <div>
                <strong>Questions with Parts:</strong> {questions.filter(q => q.has_sub_questions).length}
              </div>
            </div>
          </div>
        )}
        
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
      />
    </div>
  );
};

export default PastPaperQuestionsUpload;
