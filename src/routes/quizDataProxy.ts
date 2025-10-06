import { Router, Request, Response } from 'express';

const router = Router();

// Transform external quiz data format to internal format
function transformQuizData(externalData: any) {
  if (!externalData || !externalData.questions) {
    return externalData;
  }

  const transformedQuestions = externalData.questions.map((question: any, index: number) => {
    // Map question types from external to internal format
    let questionType = 'multiple_choice';
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        questionType = 'multiple_choice';
        break;
      case 'TRUE_FALSE':
        questionType = 'true_false';
        break;
      case 'FILL_IN_THE_BLANK':
        questionType = 'fill_in_blank';
        break;
      case 'SHORT_ANSWER':
        questionType = 'short_answer';
        break;
      default:
        questionType = 'multiple_choice';
    }

    const transformedQuestion: any = {
      id: `imported_${index + 1}`,
      question_number: question.number || index + 1,
      question_text: question.quizText || '',
      question_image: question.quizImage || '',
      question_video: question.quizVideo || '',
      question_audio: question.quizAudio || '',
      question_type: questionType,
      options: [] as any[],
      correct_answer: '',
      explanation: '',
      marks: 1
    };

    // Handle different question types
    if (questionType === 'multiple_choice') {
      transformedQuestion.options = (question.options || []).map((option: any) => ({
        option_letter: option.name || option.order ? String.fromCharCode(64 + option.order) : 'A',
        option_text: option.optionText || '',
        option_image: option.optionImage || '',
        is_correct: option.isCorrectAnswer === true
      }));
    } else if (questionType === 'true_false') {
      transformedQuestion.options = [
        { option_letter: 'A', option_text: 'True', is_correct: question.isCorrectAnswer === true },
        { option_letter: 'B', option_text: 'False', is_correct: question.isCorrectAnswer === false }
      ];
    } else if (questionType === 'fill_in_blank' || questionType === 'short_answer') {
      transformedQuestion.options = [];
      transformedQuestion.correct_answer = question.correctAnswer || '';
    }

    return transformedQuestion;
  });

  return {
    ...externalData,
    questions: transformedQuestions
  };
}

// Proxy quiz data with authentication
router.get('/proxy', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Quiz data URL is required' 
      });
    }

    console.log('Proxying request to:', url);

    let fetchUrl = url;
    
    // If it's an r2:// URL, we need to route it through our Cloudflare worker
    if (url.startsWith('r2://')) {
      // Extract the quiz ID from r2://kcse-revision-content/quiz-data/quiz_cells_g10_bio.json
      const r2Path = url.replace('r2://kcse-revision-content/', '');
      const quizId = r2Path.replace('quiz-data/', '').replace('.json', '');
      fetchUrl = `https://east-africa-education-api.pngobiro.workers.dev/api/quiz/data/${quizId}`;
      console.log('Converting R2 URL to Cloudflare API URL:', fetchUrl);
    }

    // Add authentication headers for Cloudflare API requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if the URL is from our Cloudflare domain
    const apiKey = process.env.CLOUDFLARE_API_KEY || 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure';
    if (fetchUrl.includes('east-africa-education-api.pngobiro.workers.dev') && apiKey) {
      headers['x-api-key'] = apiKey;
      console.log('Adding authentication for Cloudflare API');
    }

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to our internal format
    const transformedData = transformQuizData(data);
    
    res.json({
      success: true,
      data: transformedData
    });

  } catch (error: any) {
    console.error('Quiz data proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch quiz data' 
    });
  }
});

export default router;
