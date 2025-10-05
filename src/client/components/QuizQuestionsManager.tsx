import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import MediaUpload from './MediaUpload';
import '../styles/QuizQuestionsManager.css';

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

interface QuizQuestionsManagerProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const QuizQuestionsManager: React.FC<QuizQuestionsManagerProps> = ({ questions, onChange }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question_number: questions.length + 1,
      question_text: '',
      question_type: 'multiple_choice',
      options: [
        { option_letter: 'A', option_text: '', is_correct: false },
        { option_letter: 'B', option_text: '', is_correct: false },
        { option_letter: 'C', option_text: '', is_correct: false },
        { option_letter: 'D', option_text: '', is_correct: false },
      ],
      marks: 1,
    };
    onChange([...questions, newQuestion]);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Renumber questions
    const renumberedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      question_number: i + 1
    }));
    onChange(renumberedQuestions);
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      question_number: questions.length + 1,
      id: undefined // Remove ID so it gets a new one when saved
    };
    onChange([...questions, duplicatedQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    onChange(updatedQuestions);
  };

  const openModal = (index: number) => {
    setSelectedQuestion(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setIsModalOpen(false);
  };

  const renderQuestionPreview = (question: QuizQuestion, index: number) => {
    return (
      <div key={index} className="question-card">
        <div className="question-header">
          <div className="question-number">Q{question.question_number}</div>
          <div className="question-actions">
            <button 
              onClick={() => openModal(index)}
              className="btn-icon edit"
              title="Edit Question"
            >
              ✏️
            </button>
            <button 
              onClick={() => duplicateQuestion(index)}
              className="btn-icon duplicate"
              title="Duplicate Question"
            >
              📋
            </button>
            <button 
              onClick={() => deleteQuestion(index)}
              className="btn-icon delete"
              title="Delete Question"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div className="question-content">
          <div className="question-text">
            {question.question_text || <em>Empty question</em>}
          </div>
          
          {question.question_image && (
            <div className="media-preview">
              <img src={question.question_image} alt="Question" style={{ maxWidth: '200px', maxHeight: '100px' }} />
            </div>
          )}
          
          <div className="question-meta">
            <span className="question-type">{question.question_type.replace('_', ' ')}</span>
            <span className="question-marks">{question.marks} marks</span>
          </div>
          
          {question.question_type === 'multiple_choice' && (
            <div className="options-preview">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className={`option-preview ${option.is_correct ? 'correct' : ''}`}>
                  <span className="option-letter">{option.option_letter}.</span>
                  <span className="option-text">{option.option_text || <em>Empty option</em>}</span>
                  {option.is_correct && <span className="correct-indicator">✓</span>}
                </div>
              ))}
            </div>
          )}
          
          {(question.question_type === 'short_answer' || question.question_type === 'fill_in_blank') && question.correct_answer && (
            <div className="correct-answer-preview">
              <span className="answer-label">
                {question.question_type === 'fill_in_blank' ? 'Answer:' : 'Correct Answer(s):'}
              </span>
              <span className="answer-text">{question.correct_answer}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!isModalOpen || selectedQuestion === null) return null;

    const question = questions[selectedQuestion];

    const updateQuestionField = (field: keyof QuizQuestion, value: any) => {
      const updatedQuestion = { ...question, [field]: value };
      updateQuestion(selectedQuestion, updatedQuestion);
    };

    const updateOption = (optionIndex: number, field: keyof QuizOption, value: any) => {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
      updateQuestionField('options', updatedOptions);
    };

    const addOption = () => {
      const newLetter = String.fromCharCode(65 + question.options.length); // A, B, C, D, E...
      const newOption: QuizOption = {
        option_letter: newLetter,
        option_text: '',
        is_correct: false
      };
      updateQuestionField('options', [...question.options, newOption]);
    };

    const removeOption = (optionIndex: number) => {
      if (question.options.length > 2) {
        const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
        // Re-letter the options
        const reletteredOptions = updatedOptions.map((option, i) => ({
          ...option,
          option_letter: String.fromCharCode(65 + i)
        }));
        updateQuestionField('options', reletteredOptions);
      }
    };

    return createPortal(
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Edit Question {question.question_number}</h2>
            <button onClick={closeModal} className="modal-close">×</button>
          </div>
          
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Question Text</label>
                <textarea
                  value={question.question_text}
                  onChange={(e) => updateQuestionField('question_text', e.target.value)}
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>
              
              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={question.question_type}
                  onChange={(e) => {
                    const newType = e.target.value as 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank';
                    updateQuestionField('question_type', newType);
                    
                    // Update options based on question type
                    let newOptions: QuizOption[] = [];
                    if (newType === 'multiple_choice') {
                      newOptions = [
                        { option_letter: 'A', option_text: '', is_correct: false },
                        { option_letter: 'B', option_text: '', is_correct: false },
                        { option_letter: 'C', option_text: '', is_correct: false },
                        { option_letter: 'D', option_text: '', is_correct: false },
                      ];
                    } else if (newType === 'true_false') {
                      newOptions = [
                        { option_letter: 'A', option_text: 'True', is_correct: false },
                        { option_letter: 'B', option_text: 'False', is_correct: false },
                      ];
                    } else if (newType === 'short_answer' || newType === 'fill_in_blank') {
                      newOptions = []; // No options for short answer or fill in blank
                    }
                    updateQuestionField('options', newOptions);
                  }}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="fill_in_blank">Fill in the Blank</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Marks</label>
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) => updateQuestionField('marks', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
              
              <div className="form-group">
                <MediaUpload
                  value={question.question_image || ''}
                  onChange={(url) => updateQuestionField('question_image', url)}
                  placeholder="https://example.com/image.jpg"
                  acceptTypes="image/*,.jpg,.jpeg,.png,.gif,.webp"
                  label="Question Image"
                  mediaType="image"
                />
              </div>
              
              <div className="form-group">
                <MediaUpload
                  value={question.question_video || ''}
                  onChange={(url) => updateQuestionField('question_video', url)}
                  placeholder="https://example.com/video.mp4"
                  acceptTypes="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"
                  label="Question Video"
                  mediaType="video"
                />
              </div>
              
              <div className="form-group">
                <MediaUpload
                  value={question.question_audio || ''}
                  onChange={(url) => updateQuestionField('question_audio', url)}
                  placeholder="https://example.com/audio.mp3"
                  acceptTypes="audio/*,.mp3,.wav,.ogg,.aac,.flac"
                  label="Question Audio"
                  mediaType="audio"
                />
              </div>
            </div>
            
            {question.question_type === 'multiple_choice' && (
              <div className="options-section">
                <div className="section-header">
                  <h3>Answer Options</h3>
                  <button onClick={addOption} className="btn btn-secondary btn-sm">
                    + Add Option
                  </button>
                </div>
                
                <div className="options-list">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-editor">
                      <div className="option-header">
                        <label className="option-label">Option {option.option_letter}</label>
                        <div className="option-controls">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) => updateOption(optIndex, 'is_correct', e.target.checked)}
                            />
                            Correct Answer
                          </label>
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(optIndex)}
                              className="btn-icon delete small"
                              title="Remove Option"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="option-inputs">
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) => updateOption(optIndex, 'option_text', e.target.value)}
                          placeholder="Enter option text..."
                          className="option-text-input"
                        />
                        <div className="option-image-upload">
                          <MediaUpload
                            value={option.option_image || ''}
                            onChange={(url) => updateOption(optIndex, 'option_image', url)}
                            placeholder="Option image URL (optional)"
                            acceptTypes="image/*,.jpg,.jpeg,.png,.gif,.webp"
                            label="Option Image"
                            mediaType="image"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(question.question_type === 'short_answer' || question.question_type === 'fill_in_blank') && (
              <div className="correct-answer-section">
                <div className="section-header">
                  <h3>Correct Answer</h3>
                </div>
                <div className="form-group full-width">
                  <label>
                    {question.question_type === 'fill_in_blank' 
                      ? 'Expected Answer (what should fill the blank)' 
                      : 'Acceptable Answer(s)'}
                  </label>
                  <input
                    type="text"
                    value={question.correct_answer || ''}
                    onChange={(e) => updateQuestionField('correct_answer', e.target.value)}
                    placeholder={
                      question.question_type === 'fill_in_blank' 
                        ? 'e.g., weathering' 
                        : 'Enter the correct answer...'
                    }
                  />
                  <small className="help-text">
                    {question.question_type === 'fill_in_blank' 
                      ? 'Tip: Use underscores (___) or brackets (__________) in your question text to indicate where students should fill in the answer.'
                      : 'For multiple acceptable answers, separate them with commas (e.g., "answer1, answer2").'}
                  </small>
                </div>
              </div>
            )}
            
            <div className="explanation-section">
              <h3>Explanation (Optional)</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Explanation Text</label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestionField('explanation', e.target.value)}
                    rows={2}
                    placeholder="Explain the correct answer..."
                  />
                </div>
                
                <div className="form-group">
                  <MediaUpload
                    value={question.explanation_image || ''}
                    onChange={(url) => updateQuestionField('explanation_image', url)}
                    placeholder="https://example.com/explanation.jpg"
                    acceptTypes="image/*,.jpg,.jpeg,.png,.gif,.webp"
                    label="Explanation Image"
                    mediaType="image"
                  />
                </div>
                
                <div className="form-group">
                  <MediaUpload
                    value={question.explanation_video || ''}
                    onChange={(url) => updateQuestionField('explanation_video', url)}
                    placeholder="https://example.com/explanation.mp4"
                    acceptTypes="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"
                    label="Explanation Video"
                    mediaType="video"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button onClick={closeModal} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="quiz-questions-manager">
      <div className="manager-header">
        <div className="manager-title">
          <h2>Questions ({questions.length})</h2>
        </div>
        <button onClick={addQuestion} className="btn btn-primary">
          + Add Question
        </button>
      </div>
      
      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>No questions yet. Click "Add Question" to get started.</p>
          </div>
        ) : (
          questions.map((question, index) => renderQuestionPreview(question, index))
        )}
      </div>
      
      {renderEditModal()}
    </div>
  );
};

export default QuizQuestionsManager;