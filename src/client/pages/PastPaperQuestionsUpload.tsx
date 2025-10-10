import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import { getPastPaper, getPastPaperQuestions, savePastPaperQuestions } from '../api';
import '../styles/global.css';

// --- COMPREHENSIVE TYPESCRIPT INTERFACES FOR THE NEW STRUCTURE ---

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

interface PastPaper {
  id: string;
  name: string;
  year: number;
  type: string;
  questions_data_url?: string;
  is_published: boolean;
  subject_id?: string;
  exam_set_id?: string;
  paper_number?: number;
  paper_level?: string;
  paper_type?: string;
  is_free?: boolean;
}

// --- REACT COMPONENT ---

const PastPaperQuestionsUpload: React.FC = () => {
  const { pastPaperId } = useParams<{ pastPaperId: string }>();
  const navigate = useNavigate();
  const [pastPaper, setPastPaper] = useState<PastPaper | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  // State to hold section metadata without questions
  const [sections, setSections] = useState<Omit<QuizSection, 'questions'>[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pastPaperId) {
      fetchPastPaperData();
    }
  }, [pastPaperId]);

  const fetchPastPaperData = async () => {
    if (!pastPaperId) return;
    try {
      setLoading(true);
      setError(null);
      const pastPaperResponse = await getPastPaper(pastPaperId);
      if (pastPaperResponse.data.success && pastPaperResponse.data.data) {
        const pastPaperData = pastPaperResponse.data.data as PastPaper;
        setPastPaper(pastPaperData);
        
        if (pastPaperData.questions_data_url) {
          const questionsResponse = await getPastPaperQuestions(pastPaperId);
          if (questionsResponse.data.success && questionsResponse.data.data) {
            processQuestionData(questionsResponse.data.data);
          } else {
            initializeEmptyState();
          }
        } else {
          initializeEmptyState();
        }
      } else {
        throw new Error(pastPaperResponse.data.error || 'Failed to load past paper details');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyState = () => {
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

  const processQuestionData = (data: any) => {
    if (data.sections && Array.isArray(data.sections)) {
      const allQuestions: QuizQuestion[] = [];
      const sectionInfo: Omit<QuizSection, 'questions'>[] = [];

      data.sections.forEach((section: any) => {
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
    } else {
      // Fallback for older format
      initializeEmptyState();
    }
  };

  const handleSave = async () => {
    if (!pastPaper) return;
    
    setSaving(true);
    try {
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const estimatedTime = Math.round(questions.reduce((sum, q) => sum + (q.time_allocation || 60), 0) / 60);

      const fullPaperData = {
        title: pastPaper.name || `Paper ${pastPaper.paper_number}`,
        description: `Questions for ${pastPaper.name}`,
        paper_info: {
          paper_number: pastPaper.paper_number,
          paper_level: pastPaper.paper_level,
          paper_type: pastPaper.paper_type,
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

      const response = await savePastPaperQuestions(pastPaper.id, fullPaperData);
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
  
  const handleDownloadActualData = async () => {
    if (!pastPaperId) return;
    
    try {
      const response = await getPastPaperQuestions(pastPaperId);
      if (response.data.success && response.data.data) {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pastPaper?.name || pastPaperId}_questions.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('No saved data found for this past paper.');
      }
    } catch (err: any) {
      alert(`Failed to download data: ${err.message}`);
      console.error('Download error:', err);
    }
  };
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        processQuestionData(jsonData);
        alert(`Successfully imported questions. Click 'Save Questions' to commit the changes.`);
      } catch (err) {
        alert('Failed to parse JSON file. Please check the file format and try again.');
        console.error("JSON Parsing Error:", err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const goBack = () => navigate(-1);

  // --- JSX Rendering ---
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner"></div>
        <p>Loading Past Paper Data...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button onClick={goBack} className="btn-back">←</button>
          <h1 style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '1rem' }}>
            Manage Past Paper Questions
          </h1>
          <p className="subtitle">For: <strong>{pastPaper?.name || pastPaperId}</strong></p>
        </div>
        <div className="action-buttons">
          <label className="btn btn-secondary">
            📥 Import JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button onClick={handleDownloadActualData} className="btn btn-success">
            📥 Download Saved Data
          </button>
          <button onClick={handleDownloadTemplate} className="btn btn-info">
            📋 Download Template
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? '💾 Saving...' : '💾 Save Questions'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="summary-panel">
        <div><strong>Paper ID:</strong> {pastPaper?.id}</div>
        <div><strong>Subject:</strong> {pastPaper?.subject_id || 'N/A'}</div>
        <div><strong>Sections:</strong> {sections.length}</div>
        <div><strong>Total Questions:</strong> {questions.length}</div>
        <div><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + q.marks, 0)}</div>
        <div><strong>Est. Time:</strong> {Math.round(questions.reduce((sum, q) => sum + (q.time_allocation || 60), 0) / 60)} min</div>
      </div>

      <QuizQuestionsManager questions={questions} onChange={setQuestions} />
    </div>
  );
};

export default PastPaperQuestionsUpload;