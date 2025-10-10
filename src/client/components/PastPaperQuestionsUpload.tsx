import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/PastPaperQuestionsUpload.css';

interface ColumnAItem {
  item_number: string;
  item_text: string;
  item_image?: string;
  correct_match: string;
}

interface ColumnBItem {
  item_letter: string;
  item_text: string;
  item_image?: string;
}

interface OrderingItem {
  item_id: string;
  item_text: string;
  item_image?: string;
  correct_position: number;
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

interface QuizQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank' | 'short_essay' | 'matching' | 'ordering' | 'multiple_response';
  question_image?: string;
  question_video?: string;
  question_audio?: string;
  options?: QuizOption[];
  correct_answer?: string;
  correct_answers?: string[];
  explanation?: string;
  marks: number;
  is_free?: boolean;
  difficulty_level?: string;
  time_allocation?: number;
  learning_objective?: string;
  answer_space?: string;
  column_a?: ColumnAItem[];
  column_b?: ColumnBItem[];
  items?: OrderingItem[];
  correct_order?: string;
}

interface QuizSection {
  section_id: string;
  section_name: string;
  section_description: string;
  section_instructions: string[];
  total_marks: number;
  estimated_duration: number;
  section_image?: string;
  section_video?: string;
  section_audio?: string;
  questions: QuizQuestion[];
}

interface QuizTemplate {
  title: string;
  description: string;
  paper_info: {
    paper_number: number;
    paper_level: number;
    paper_type: string;
    subject_id: string;
    total_questions: number;
    total_marks: number;
    estimated_time: number;
  };
  instructions: string[];
  sections: QuizSection[];
}

interface PastPaperQuestionsUploadProps {
  onUpload: (template: QuizTemplate) => void;
}

const PastPaperQuestionsUpload: React.FC<PastPaperQuestionsUploadProps> = ({ onUpload }) => {
  const [jsonText, setJsonText] = useState('');
  const [parsedTemplate, setParsedTemplate] = useState<QuizTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setError(null);
    setParsedTemplate(null);
  };

  const validateAndParseJson = () => {
    try {
      const template: QuizTemplate = JSON.parse(jsonText);

      // Basic validation
      if (!template.title || !template.sections || !Array.isArray(template.sections)) {
        throw new Error('Invalid template structure. Must have title and sections array.');
      }

      // Validate sections and questions
      let totalQuestions = 0;
      let totalMarks = 0;

      template.sections.forEach((section, sectionIndex) => {
        if (!section.questions || !Array.isArray(section.questions)) {
          throw new Error(`Section ${sectionIndex + 1} must have a questions array.`);
        }

        section.questions.forEach((question, questionIndex) => {
          if (!question.id || !question.question_text || !question.question_type) {
            throw new Error(`Question ${questionIndex + 1} in section ${sectionIndex + 1} is missing required fields.`);
          }

          // Validate question types
          const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'fill_in_blank', 'short_essay', 'matching', 'ordering', 'multiple_response'];
          if (!validTypes.includes(question.question_type)) {
            throw new Error(`Invalid question type: ${question.question_type}`);
          }

          // Type-specific validation
          if (question.question_type === 'multiple_choice' || question.question_type === 'true_false' || question.question_type === 'multiple_response') {
            if (!question.options || !Array.isArray(question.options)) {
              throw new Error(`Question ${question.id} must have options array.`);
            }
          }

          if (question.question_type === 'matching') {
            if (!question.column_a || !question.column_b) {
              throw new Error(`Matching question ${question.id} must have column_a and column_b.`);
            }
          }

          if (question.question_type === 'ordering') {
            if (!question.items) {
              throw new Error(`Ordering question ${question.id} must have items array.`);
            }
          }

          totalQuestions++;
          totalMarks += question.marks;
        });
      });

      // Update totals
      template.paper_info.total_questions = totalQuestions;
      template.paper_info.total_marks = totalMarks;

      setParsedTemplate(template);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setParsedTemplate(null);
    }
  };

  const handleUpload = () => {
    if (parsedTemplate) {
      onUpload(parsedTemplate);
      setJsonText('');
      setParsedTemplate(null);
      setIsPreviewOpen(false);
    }
  };

  const renderQuestionPreview = (question: QuizQuestion) => {
    return (
      <div key={question.id} className="question-preview">
        <div className="question-header">
          <span className="question-number">Q{question.question_number}</span>
          <span className="question-type">{question.question_type.replace('_', ' ')}</span>
          <span className="question-marks">({question.marks} marks)</span>
        </div>

        <div className="question-content">
          <p className="question-text">{question.question_text}</p>

          {question.question_image && (
            <div className="question-media">
              <img src={question.question_image} alt="Question" style={{ maxWidth: '200px' }} />
            </div>
          )}

          {question.question_type === 'multiple_choice' && question.options && (
            <div className="options-list">
              {question.options.map((option) => (
                <div key={option.option_letter} className={`option ${option.is_correct ? 'correct' : ''}`}>
                  <span className="option-letter">{option.option_letter}.</span>
                  <span className="option-text">{option.option_text}</span>
                  {option.is_correct && <span className="correct-indicator">✓</span>}
                </div>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && question.options && (
            <div className="true-false-options">
              {question.options.map((option) => (
                <div key={option.option_letter} className={`option ${option.is_correct ? 'correct' : ''}`}>
                  <span className="option-text">{option.option_text}</span>
                  {option.is_correct && <span className="correct-indicator">✓</span>}
                </div>
              ))}
            </div>
          )}

          {question.question_type === 'multiple_response' && question.options && (
            <div className="options-list">
              {question.options.map((option) => (
                <div key={option.option_letter} className={`option ${option.is_correct ? 'correct' : ''}`}>
                  <span className="option-letter">{option.option_letter}.</span>
                  <span className="option-text">{option.option_text}</span>
                  {option.is_correct && <span className="correct-indicator">✓</span>}
                </div>
              ))}
            </div>
          )}

          {question.question_type === 'matching' && question.column_a && question.column_b && (
            <div className="matching-columns">
              <div className="column">
                <h4>Column A</h4>
                {question.column_a.map((item) => (
                  <div key={item.item_number} className="matching-item">
                    <span className="item-number">{item.item_number}.</span>
                    <span className="item-text">{item.item_text}</span>
                  </div>
                ))}
              </div>
              <div className="column">
                <h4>Column B</h4>
                {question.column_b.map((item) => (
                  <div key={item.item_letter} className="matching-item">
                    <span className="item-letter">{item.item_letter}.</span>
                    <span className="item-text">{item.item_text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.question_type === 'ordering' && question.items && (
            <div className="ordering-items">
              <h4>Items to order:</h4>
              {question.items.map((item) => (
                <div key={item.item_id} className="ordering-item">
                  <span className="item-text">{item.item_text}</span>
                </div>
              ))}
            </div>
          )}

          {(question.question_type === 'short_answer' || question.question_type === 'fill_in_blank') && (
            <div className="answer-preview">
              <strong>Expected Answer:</strong> {question.correct_answer}
            </div>
          )}

          {question.question_type === 'short_essay' && (
            <div className="essay-preview">
              <strong>Model Answer:</strong> {question.correct_answer}
            </div>
          )}

          {question.explanation && (
            <div className="explanation-preview">
              <strong>Explanation:</strong> {question.explanation}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!isPreviewOpen || !parsedTemplate) return null;

    return createPortal(
      <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Quiz Template Preview</h2>
            <button onClick={() => setIsPreviewOpen(false)} className="close-button">×</button>
          </div>

          <div className="modal-body">
            <div className="template-header">
              <h3>{parsedTemplate.title}</h3>
              <p>{parsedTemplate.description}</p>
              <div className="template-info">
                <span>Questions: {parsedTemplate.paper_info.total_questions}</span>
                <span>Total Marks: {parsedTemplate.paper_info.total_marks}</span>
                <span>Subject: {parsedTemplate.paper_info.subject_id}</span>
              </div>
            </div>

            <div className="instructions-preview">
              <h4>Instructions:</h4>
              <ul>
                {parsedTemplate.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>

            <div className="sections-preview">
              {parsedTemplate.sections.map((section) => (
                <div key={section.section_id} className="section-preview">
                  <div className="section-header">
                    <h4>{section.section_name}</h4>
                    <p>{section.section_description}</p>
                    <div className="section-info">
                      <span>Marks: {section.total_marks}</span>
                      <span>Duration: {section.estimated_duration} min</span>
                    </div>
                  </div>

                  <div className="section-instructions">
                    <h5>Instructions:</h5>
                    <ul>
                      {section.section_instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="section-questions">
                    {section.questions.map((question) => renderQuestionPreview(question))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={() => setIsPreviewOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleUpload} className="btn btn-primary">
              Upload Template
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="past-paper-questions-upload">
      <div className="upload-header">
        <h2>Upload Quiz Template (JSON)</h2>
        <p>Paste your quiz template JSON below. The template should follow the new format with questions nested inside sections.</p>
      </div>

      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="json-input">Quiz Template JSON:</label>
          <textarea
            id="json-input"
            value={jsonText}
            onChange={handleJsonChange}
            placeholder="Paste your JSON template here..."
            rows={20}
            className="json-textarea"
          />
          <small className="help-text">
            Use the questions_types.json file as a reference for the correct format.
            Questions should be nested inside sections, not in a separate top-level array.
          </small>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="upload-actions">
          <button
            onClick={validateAndParseJson}
            className="btn btn-secondary"
            disabled={!jsonText.trim()}
          >
            Validate & Preview
          </button>

          {parsedTemplate && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="btn btn-primary"
            >
              Preview Template
            </button>
          )}
        </div>
      </div>

      {renderPreviewModal()}
    </div>
  );
};

export default PastPaperQuestionsUpload;
