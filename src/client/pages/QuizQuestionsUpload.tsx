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
  
  // Enhanced fields for version control, access, and organization
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
        
        // Enhanced default fields
        question_id: 'q_1',
        version: '1.0',
        is_free: false, // Default to paid
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
                           q.type === 'FILL_IN_BLANK' || q.type === 'FILL_IN_THE_BLANK' ? 'fill_in_blank' :
                           q.question_type || 'multiple_choice';
        
        let options = [];
        let correctAnswer = q.correctAnswer || q.correct_answer || q.answer || undefined;

        if (q.options && Array.isArray(q.options)) {
          // Cloudflare API format with options array
          options = q.options.map((opt: any, optIndex: number) => ({
            option_letter: opt.name || opt.option_letter || String.fromCharCode(65 + optIndex),
            option_text: opt.optionText || opt.option_text || opt.text || '',
            option_image: opt.optionImage || opt.option_image || opt.image || undefined,
            is_correct: opt.isCorrectAnswer || opt.is_correct || opt.correct || false
          }));

          // For fill-in-blank questions, extract the answer from options
          if (questionType === 'fill_in_blank' && options.length > 0) {
            const correctOption = options.find((opt: any) => opt.is_correct);
            if (correctOption) {
              correctAnswer = correctOption.option_text;
            }
          }
        } else if (q.type === 'TRUE_FALSE') {
          // True/False question - handle both formats
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
          // Fill-in-blank question without options array - use correctAnswer directly
          options = []; // No options needed for display
          // correctAnswer is already set above
        } else {
          // Default empty options for multiple choice
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
          
          // Enhanced fields for version control, access, and organization
          question_id: q.questionId || `q_${index + 1}`,
          version: q.questionVersion || q.version || "1.0",
          is_free: q.isFree !== undefined ? q.isFree : (q.is_free !== undefined ? q.is_free : true), // Default to free if not specified
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
      
      // Prepare the data for API submission with enhanced R2 format
      const quizData = {
        // Quiz metadata with version control
        examSetId: `examset_${new Date().getFullYear()}_${quiz.topic_id}`,
        examSetName: `${new Date().getFullYear()} Quiz Data - ${quiz.name}`,
        subjectId: quiz.topic_id,
        year: new Date().getFullYear(),
        version: "1.0.0",
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        
        // Access control settings
        accessLevel: "PAID", // Default to paid
        defaultIsFree: false,
        
        // Quiz configuration
        totalQuestions: questions.length,
        metadata: {
          totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          estimatedDuration: questions.reduce((sum, q) => sum + (q.time_allocation || 2), 0),
          difficultyDistribution: {
            beginner: questions.filter(q => q.difficulty_level === 'BEGINNER').length,
            intermediate: questions.filter(q => q.difficulty_level === 'INTERMEDIATE').length,
            advanced: questions.filter(q => q.difficulty_level === 'ADVANCED').length
          },
          freeQuestions: questions.filter(q => q.is_free === true).length,
          paidQuestions: questions.filter(q => q.is_free === false).length
        },
        
        questions: questions.map((q, index) => {
          // Convert frontend format to enhanced Cloudflare API format
          const baseQuestion = {
            number: q.question_number || index + 1,
            questionText: q.question_text,
            questionImage: q.question_image || '',
            questionVideo: q.question_video || '',
            questionAudio: q.question_audio || '',
            questionPdf: '',
            solutionText: q.explanation || '',
            solutionImage: q.explanation_image || '',
            solutionPdf: '',
            solutionVideo: q.explanation_video || '',
            solutionUrl: '',
            
            // Enhanced fields
            questionId: q.question_id || `q_${index + 1}`,
            version: q.version || "1.0",
            isFree: q.is_free !== undefined ? q.is_free : false, // Default to paid
            part: q.part || null,
            mainQuestion: q.main_question || (q.question_number || index + 1),
            subQuestion: q.sub_question || null,
            hasSubQuestions: q.has_sub_questions || false,
            hasParts: q.has_sub_questions || false, // Legacy field for compatibility
            
            // Academic properties
            paperLevel: q.marks || 1,
            marks: q.marks || 1,
            difficultyLevel: q.difficulty_level || 'INTERMEDIATE',
            timeAllocation: q.time_allocation || 2,
            learningObjective: q.learning_objective || '',
            lastModified: q.last_modified || new Date().toISOString().split('T')[0],
            changeLog: q.change_log || ''
          };

          if (q.question_type === 'multiple_choice') {
            return {
              ...baseQuestion,
              type: 'MULTIPLE_CHOICE',
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
              ...baseQuestion,
              type: 'TRUE_FALSE',
              isCorrectAnswer: q.options?.[0]?.is_correct || false,
              explanation: q.explanation || 'No explanation provided'
            };
          } else if (q.question_type === 'fill_in_blank') {
            return {
              ...baseQuestion,
              type: 'FILL_IN_THE_BLANK',
              correctAnswer: q.correct_answer || '',
              blankIndex: q.question_text.indexOf('___') > -1 ? q.question_text.indexOf('___') : 0
            };
          } else {
            // Default to multiple choice format
            return {
              ...baseQuestion,
              type: 'MULTIPLE_CHOICE',
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

      console.log('Uploading enhanced quiz data to R2:', quizData);
      
      // Import the uploadQuizData function
      const { uploadQuizData } = await import('../api');
      const response = await uploadQuizData(quiz.id, quizData);
      
      if (response.data.success) {
        const freeCount = questions.filter(q => q.is_free === true).length;
        const paidCount = questions.filter(q => q.is_free === false).length;
        
        alert(`Successfully saved ${questions.length} questions to R2 storage for ${quiz.name}!\n\nBreakdown:\n• Free questions: ${freeCount}\n• Paid questions: ${paidCount}\n• Total marks: ${quizData.metadata.totalMarks}\n• Estimated duration: ${quizData.metadata.estimatedDuration} minutes\n\nR2 Key: ${response.data.data.r2Key}`);
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

  const handleDownloadTemplate = () => {
    const templateData = {
      // Quiz Metadata with Version Control
      quizId: "sample_quiz_template_001",
      quizName: "Sample Quiz Template - Ecological Interactions",
      topicId: "topic_general_biology",
      version: "1.0.0",
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString(),
      
      // Access Control Settings
      accessLevel: "PAID", // Options: "FREE", "PAID", "PREMIUM"
      defaultIsFree: false, // Default access status for questions
      
      // Quiz Configuration
      totalQuestions: 7,
      estimatedDuration: 15, // minutes
      difficultyLevel: "INTERMEDIATE", // Options: "BEGINNER", "INTERMEDIATE", "ADVANCED"
      tags: ["ecology", "energy_flow", "food_webs", "biology"],
      
      questions: [
        {
          // Basic Question Info
          number: 1,
          questionId: "q_energy_source_001",
          type: "MULTIPLE_CHOICE",
          quizText: "What is the ultimate source of energy for most living organisms on Earth?",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: false, // Override default - this question requires payment
          part: "A", // Question part (A, B, C or i, ii, iii)
          mainQuestion: 1, // Main question number
          subQuestion: null, // Sub-question identifier (null for main questions)
          hasSubQuestions: false, // Whether this question has parts
          
          // Academic Properties
          difficultyLevel: "INTERMEDIATE",
          marks: 2,
          timeAllocation: 2, // minutes
          learningObjective: "Identify the primary source of energy in ecosystems",
          
          options: [
            {
              order: 1,
              name: "A",
              optionText: "Water",
              optionImage: "",
              explanation: "Incorrect. Water is essential for life but is not the primary source of energy.",
              isCorrectAnswer: false
            },
            {
              order: 2,
              name: "B",
              optionText: "The Sun",
              optionImage: "",
              explanation: "Correct! The sun provides solar energy, which producers convert into chemical energy through photosynthesis.",
              isCorrectAnswer: true
            },
            {
              order: 3,
              name: "C",
              optionText: "Soil",
              optionImage: "",
              explanation: "Incorrect. Soil provides nutrients, but not the initial energy for the ecosystem.",
              isCorrectAnswer: false
            },
            {
              order: 4,
              name: "D",
              optionText: "Wind",
              optionImage: "",
              explanation: "Incorrect. Wind is a form of energy but not the primary source for living organisms.",
              isCorrectAnswer: false
            }
          ]
        },
        {
          number: 2,
          questionId: "q_energy_matter_flow_002",
          type: "TRUE_FALSE",
          quizText: "Energy in an ecosystem is recycled, while matter flows in one direction.",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: true, // Free access question
          part: null,
          mainQuestion: 2,
          subQuestion: null,
          hasSubQuestions: false,
          
          // Academic Properties
          difficultyLevel: "INTERMEDIATE",
          marks: 1,
          timeAllocation: 1.5,
          learningObjective: "Distinguish between energy flow and matter cycling in ecosystems",
          
          isCorrectAnswer: false,
          explanation: "This is false. The opposite is true: Energy flows in one direction (unidirectional flow) and is lost as heat at each trophic level, while matter (nutrients) is recycled through biogeochemical cycles."
        },
        {
          number: 3,
          questionId: "q_consumer_types_003",
          type: "FILL_IN_THE_BLANK",
          quizText: "Organisms that feed on plants are called herbivores or ___ consumers.",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: false,
          part: null,
          mainQuestion: 3,
          subQuestion: null,
          hasSubQuestions: false,
          
          // Academic Properties
          difficultyLevel: "BEGINNER",
          marks: 1,
          timeAllocation: 1,
          learningObjective: "Classify consumers by trophic level",
          
          blankIndex: 53,
          correctAnswer: "primary"
        },
        {
          // Example of a main question with sub-parts
          number: 4,
          questionId: "q_food_webs_main_004",
          type: "MULTIPLE_CHOICE",
          quizText: "Study the following ecosystem scenario: In a forest, deer eat grass, wolves eat deer, and decomposers break down dead organisms.",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: false,
          part: null, // Main question has no part designation
          mainQuestion: 4,
          subQuestion: null,
          hasSubQuestions: true, // This question has sub-parts
          
          // Academic Properties
          difficultyLevel: "ADVANCED",
          marks: 3,
          timeAllocation: 4,
          learningObjective: "Analyze complex food web relationships",
          
          options: [
            {
              order: 1,
              name: "A",
              optionText: "This represents a simple food chain only.",
              optionImage: "",
              explanation: "Incorrect. This scenario can be part of a more complex food web.",
              isCorrectAnswer: false
            },
            {
              order: 2,
              name: "B",
              optionText: "This represents components of a food web.",
              optionImage: "",
              explanation: "Correct! This shows multiple feeding relationships that form part of a food web.",
              isCorrectAnswer: true
            },
            {
              order: 3,
              name: "C",
              optionText: "Decomposers are not part of food webs.",
              optionImage: "",
              explanation: "Incorrect. Decomposers are essential components of food webs.",
              isCorrectAnswer: false
            },
            {
              order: 4,
              name: "D",
              optionText: "Only producers and consumers are shown.",
              optionImage: "",
              explanation: "Incorrect. Decomposers are also mentioned in the scenario.",
              isCorrectAnswer: false
            }
          ]
        },
        {
          // Sub-question 4(a)
          number: 5,
          questionId: "q_food_webs_004a",
          type: "MULTIPLE_CHOICE",
          quizText: "4(a). In the ecosystem described above, which organism is the primary consumer?",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: false,
          part: "a", // Sub-part designation
          mainQuestion: 4,
          subQuestion: "a",
          hasSubQuestions: false,
          
          // Academic Properties
          difficultyLevel: "INTERMEDIATE",
          marks: 1,
          timeAllocation: 1,
          learningObjective: "Identify primary consumers in food chains",
          
          options: [
            {
              order: 1,
              name: "A",
              optionText: "Grass",
              optionImage: "",
              explanation: "Incorrect. Grass is a producer, not a consumer.",
              isCorrectAnswer: false
            },
            {
              order: 2,
              name: "B",
              optionText: "Deer",
              optionImage: "",
              explanation: "Correct! Deer feed directly on producers (grass), making them primary consumers.",
              isCorrectAnswer: true
            },
            {
              order: 3,
              name: "C",
              optionText: "Wolves",
              optionImage: "",
              explanation: "Incorrect. Wolves are secondary consumers as they eat primary consumers.",
              isCorrectAnswer: false
            },
            {
              order: 4,
              name: "D",
              optionText: "Decomposers",
              optionImage: "",
              explanation: "Incorrect. Decomposers have a different role in the ecosystem.",
              isCorrectAnswer: false
            }
          ]
        },
        {
          // Sub-question 4(b) with Roman numerals
          number: 6,
          questionId: "q_food_webs_004b",
          type: "TRUE_FALSE",
          quizText: "4(b)(i). The wolves in this ecosystem are tertiary consumers.",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: true, // Free sub-question
          part: "b(i)", // Roman numeral sub-part
          mainQuestion: 4,
          subQuestion: "b(i)",
          hasSubQuestions: false,
          
          // Academic Properties
          difficultyLevel: "INTERMEDIATE",
          marks: 1,
          timeAllocation: 1,
          learningObjective: "Classify consumers by trophic level in food chains",
          
          isCorrectAnswer: false,
          explanation: "False. Wolves are secondary consumers because they eat primary consumers (deer). Tertiary consumers would eat secondary consumers."
        },
        {
          // Independent question demonstrating version tracking
          number: 7,
          questionId: "q_biomass_pyramid_005",
          type: "FILL_IN_THE_BLANK",
          quizText: "The total mass of living organisms at each trophic level forms a _____ pyramid.",
          quizImage: "",
          quizVideo: "",
          quizAudio: "",
          
          // Question Access & Organization
          isFree: true, // Free question
          part: null,
          mainQuestion: 5,
          subQuestion: null,
          hasSubQuestions: false,
          
          // Academic Properties
          difficultyLevel: "BEGINNER",
          marks: 1,
          timeAllocation: 1,
          learningObjective: "Understand biomass distribution in ecosystems",
          
          blankIndex: 65,
          correctAnswer: "biomass",
          
          // Version tracking for individual questions
          questionVersion: "1.1",
          lastModified: "2025-10-07",
          changeLog: "Updated explanation for clarity"
        }
      ],
      
      // Quiz Metadata
      metadata: {
        totalMarks: 10,
        passingScore: 6,
        timeLimit: 15,
        attempts: 3,
        showCorrectAnswers: true,
        randomizeQuestions: false,
        randomizeOptions: true
      }
    };

    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz_template.json';
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

export default QuizQuestionsUpload;
