# Quiz JSON Template Documentation

## Overview
This document explains how to create quiz questions in JSON format for upload to the quiz management system.

## Template Download
Use the "📋 Download Template" button in the quiz questions interface to get a ready-to-use template file.

## JSON Structure

### Root Object
```json
{
  "examSetId": "examset_2024_your_quiz",
  "examSetName": "Your Quiz Name",
  "subjectId": "subject_biology", 
  "year": 2024,
  "questions": [...]
}
```

### Required Root Fields
- **examSetId**: Unique identifier (string) - use format `examset_YEAR_description`
- **examSetName**: Display name for the quiz (string)
- **subjectId**: Subject identifier (string) - e.g., `subject_biology`, `subject_math`
- **year**: Academic year (number)
- **questions**: Array of question objects

### Question Object Structure
```json
{
  "number": 1,
  "type": "MULTIPLE_CHOICE",
  "questionText": "Your question here?",
  "questionImage": "",
  "solutionText": "Explanation of the answer",
  "part": 1,
  "paperLevel": 1,
  "isFree": true,
  "hasParts": false,
  "options": [...]
}
```

### Question Fields
- **number**: Question number (integer, sequential starting from 1)
- **type**: Question type (string) - see supported types below
- **questionText**: The question text (string)
- **questionImage**: Optional image URL (string, can be empty)
- **solutionText**: Explanation of the correct answer (string)
- **part**: Paper part number (integer, usually 1)
- **paperLevel**: Difficulty level (integer, 1-3 where 1=easy, 2=medium, 3=hard)
- **isFree**: Whether question is free access (boolean, usually true)
- **hasParts**: Whether question has sub-parts (boolean, usually false)
- **options**: Array of answer option objects

## Supported Question Types

### 1. MULTIPLE_CHOICE
For questions with 2-4 answer choices.

**Options Format:**
```json
"options": [
  {
    "order": 1,
    "name": "A",
    "optionText": "First option",
    "isCorrectAnswer": false
  },
  {
    "order": 2,
    "name": "B", 
    "optionText": "Second option",
    "isCorrectAnswer": true
  },
  {
    "order": 3,
    "name": "C",
    "optionText": "Third option", 
    "isCorrectAnswer": false
  },
  {
    "order": 4,
    "name": "D",
    "optionText": "Fourth option",
    "isCorrectAnswer": false
  }
]
```

### 2. TRUE_FALSE
For true/false questions.

**Options Format:**
```json
"options": [
  {
    "order": 1,
    "name": "True",
    "optionText": "True",
    "isCorrectAnswer": true
  },
  {
    "order": 2,
    "name": "False", 
    "optionText": "False",
    "isCorrectAnswer": false
  }
]
```

### 3. FILL_IN_BLANK
For fill-in-the-blank questions.

**Options Format:**
```json
"options": [
  {
    "order": 1,
    "name": "Answer",
    "optionText": "correct answer",
    "isCorrectAnswer": true
  }
]
```

## Option Object Fields
- **order**: Option order number (integer, sequential starting from 1)
- **name**: Option identifier (string) - "A", "B", "C", "D" for multiple choice; "True", "False" for boolean; "Answer" for fill-in-blank
- **optionText**: The option text content (string)
- **isCorrectAnswer**: Whether this is the correct answer (boolean) - exactly one must be true per question

## Validation Rules

1. **Question Numbers**: Must be sequential starting from 1
2. **Correct Answers**: Exactly one option per question must have `isCorrectAnswer: true`
3. **Option Names**: Must follow the naming conventions for each question type
4. **Required Fields**: All fields marked as required must be present
5. **Data Types**: All fields must use the correct data type (string, number, boolean, array)

## Example Complete Question Set

See the downloaded template file for a complete example with all question types.

## Upload Process

1. Create your JSON file following this structure
2. Go to the quiz questions page
3. Click "📥 Import JSON" 
4. Select your JSON file
5. Questions will be validated and imported
6. System will automatically save to R2 storage
7. Questions will persist on page reload

## Common Issues

- **Validation Errors**: Check that all required fields are present and correctly formatted
- **Upload Failures**: Ensure the Express server is running and R2 upload endpoint is available
- **Questions Not Persisting**: Restart the Express server if the upload endpoint returns 404

## Support

For issues with the template or upload process, check the browser console for error messages and ensure all servers are running properly.
