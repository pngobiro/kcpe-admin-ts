# Enhanced Quiz JSON Template Documentation

## Overview
This document explains how to create quiz questions in JSON format with advanced features including version control, access control (free/paid), and question parts (sub-questions) for upload to the quiz management system.

## New Features in v2.0
- **🔐 Access Control**: Individual question-level free/paid status
- **📝 Question Parts**: Support for sub-questions (1a, 1b, 1c or 1i, 1ii, 1iii)
- **🏷️ Version Control**: Track template and individual question versions
- **⚡ Difficulty Levels**: Beginner, Intermediate, Advanced classifications
- **⏱️ Time Management**: Individual question time allocations
- **🎯 Learning Objectives**: Educational goal tracking

## Template Download
Use the "📋 Download Template" button in the quiz questions interface to get a ready-to-use template file with all new features.

## JSON Structure

### Enhanced Root Object
```json
{
  "quizId": "sample_quiz_template_001",
  "quizName": "Sample Quiz Template - Ecological Interactions",
  "topicId": "topic_general_biology",
  "version": "1.0.0",
  "createdDate": "2025-10-07",
  "lastModified": "2025-10-07T10:30:00Z",
  
  "isPaid": true,
  "defaultIsFree": false,
  
  "totalQuestions": 7,
  "estimatedDuration": 15,
  "difficultyLevel": "INTERMEDIATE",
  "tags": ["ecology", "energy_flow", "food_webs", "biology"],
  
  "questions": [...],
  
  "metadata": {
    "totalMarks": 10,
    "passingScore": 6,
    "timeLimit": 15,
    "attempts": 3,
    "showCorrectAnswers": true,
    "randomizeQuestions": false,
    "randomizeOptions": true
  }
}
```

### Enhanced Root Fields
- **version**: Template version (string) - semantic versioning format (e.g., "1.0.0")
- **createdDate**: Creation date (string) - ISO date format
- **lastModified**: Last modification timestamp (string) - ISO datetime format
- **isPaid**: Quiz access level (boolean) - true for paid quiz, false for free quiz
- **defaultIsFree**: Default access status for questions (boolean)
- **totalQuestions**: Total number of questions (integer)
- **estimatedDuration**: Total estimated time in minutes (integer)
- **difficultyLevel**: Overall quiz difficulty - "BEGINNER", "INTERMEDIATE", "ADVANCED"
- **tags**: Array of topic tags for categorization
- **metadata**: Quiz configuration and settings

### Enhanced Question Object Structure
```json
{
  "number": 1,
  "questionId": "q_energy_source_001",
  "type": "MULTIPLE_CHOICE",
  "quizText": "Your question here?",
  "quizImage": "",
  "quizVideo": "",
  "quizAudio": "",
  
  "isFree": false,
  "part": "A",
  "mainQuestion": 1,
  "subQuestion": null,
  "hasSubQuestions": false,
  
  "difficultyLevel": "INTERMEDIATE",
  "marks": 2,
  "timeAllocation": 2,
  "learningObjective": "Identify the primary source of energy in ecosystems",
  
  "questionVersion": "1.0",
  "lastModified": "2025-10-07",
  "changeLog": "Initial creation",
  
  "options": [...]
}
```

### New Question Fields

#### Access Control
- **isFree**: Individual question access (boolean) - overrides defaultIsFree
- **accessLevel**: Optional question-specific access level

#### Question Organization
- **questionId**: Unique question identifier (string) - format: "q_description_number"
- **part**: Question part designation (string or null)
  - For lettered parts: "A", "B", "C", "D"
  - For numbered parts: "i", "ii", "iii", "iv"
  - For compound parts: "a(i)", "b(ii)", "c(iii)"
- **mainQuestion**: Main question number (integer)
- **subQuestion**: Sub-question identifier (string or null)
- **hasSubQuestions**: Whether this question has sub-parts (boolean)

#### Academic Properties
- **difficultyLevel**: Question difficulty - "BEGINNER", "INTERMEDIATE", "ADVANCED"
- **marks**: Point value (integer) - academic weight
- **timeAllocation**: Recommended time in minutes (number)
- **learningObjective**: Educational goal (string)

#### Version Control
- **questionVersion**: Individual question version (string)
- **lastModified**: Question modification date (string)
- **changeLog**: Description of recent changes (string)

## Question Types with Enhanced Features

### 1. MULTIPLE_CHOICE with Parts
```json
{
  "number": 4,
  "questionId": "q_food_webs_main_004",
  "type": "MULTIPLE_CHOICE",
  "quizText": "Study the following ecosystem scenario...",
  
  "isFree": false,
  "part": null,
  "mainQuestion": 4,
  "subQuestion": null,
  "hasSubQuestions": true,
  
  "difficultyLevel": "ADVANCED",
  "marks": 3,
  "timeAllocation": 4,
  "learningObjective": "Analyze complex food web relationships",
  
  "options": [...]
}
```

### 2. Sub-Question Example (4a)
```json
{
  "number": 5,
  "questionId": "q_food_webs_004a",
  "type": "MULTIPLE_CHOICE",
  "quizText": "4(a). In the ecosystem described above, which organism is the primary consumer?",
  
  "isFree": false,
  "part": "a",
  "mainQuestion": 4,
  "subQuestion": "a",
  "hasSubQuestions": false,
  
  "difficultyLevel": "INTERMEDIATE",
  "marks": 1,
  "timeAllocation": 1,
  
  "options": [...]
}
```

### 3. Roman Numeral Sub-Question (4b(i))
```json
{
  "number": 6,
  "questionId": "q_food_webs_004b",
  "type": "TRUE_FALSE",
  "quizText": "4(b)(i). The wolves in this ecosystem are tertiary consumers.",
  
  "isFree": true,
  "part": "b(i)",
  "mainQuestion": 4,
  "subQuestion": "b(i)",
  "hasSubQuestions": false,
  
  "difficultyLevel": "INTERMEDIATE",
  "marks": 1,
  "timeAllocation": 1
}
```

## Access Control Examples

### Free Questions
```json
{
  "isFree": true,  // Free access
  "difficultyLevel": "BEGINNER"
}
```

### Paid Questions
```json
{
  "isFree": false,  // Requires payment
  "difficultyLevel": "ADVANCED"
}
```

### Mixed Access Quiz
```json
{
  "isPaid": true,  // Overall quiz is paid
  "defaultIsFree": false,  // Most questions are paid by default
  "questions": [
    { "isFree": true, "quizText": "Free preview question..." },
    { "isFree": false, "quizText": "Premium question..." },
    { "isFree": true, "quizText": "Another free sample..." }
  ]
}
```

## Question Parts Structure

### Lettered Parts (A, B, C)
```json
[
  {
    "number": 1,
    "quizText": "Main question text...",
    "part": null,
    "hasSubQuestions": true
  },
  {
    "number": 2,
    "quizText": "1(A). Sub-question A...",
    "part": "A",
    "mainQuestion": 1,
    "subQuestion": "A"
  },
  {
    "number": 3,
    "quizText": "1(B). Sub-question B...",
    "part": "B",
    "mainQuestion": 1,
    "subQuestion": "B"
  }
]
```

### Roman Numeral Parts (i, ii, iii)
```json
[
  {
    "number": 4,
    "quizText": "2(i). First roman numeral part...",
    "part": "i",
    "mainQuestion": 2,
    "subQuestion": "i"
  },
  {
    "number": 5,
    "quizText": "2(ii). Second roman numeral part...",
    "part": "ii",
    "mainQuestion": 2,
    "subQuestion": "ii"
  }
]
```

### Compound Parts (a(i), b(ii))
```json
{
  "number": 6,
  "quizText": "3(a)(i). Compound sub-question...",
  "part": "a(i)",
  "mainQuestion": 3,
  "subQuestion": "a(i)"
}
```

## Version Control Best Practices

### Template Versioning
- Use semantic versioning: "MAJOR.MINOR.PATCH"
- Increment MAJOR for breaking changes
- Increment MINOR for new features
- Increment PATCH for bug fixes

### Question Versioning
```json
{
  "questionVersion": "1.2",
  "lastModified": "2025-10-07",
  "changeLog": "Updated explanation for clarity and fixed typo in option B"
}
```

## Difficulty Levels

### BEGINNER
- Simple recall questions
- Basic definitions
- Straightforward applications
- 1-2 minutes allocation

### INTERMEDIATE  
- Analysis and comparison
- Application of concepts
- Multi-step problems
- 2-3 minutes allocation

### ADVANCED
- Synthesis and evaluation
- Complex problem solving
- Critical thinking required
- 3+ minutes allocation

## Upload Process with Enhanced Features

1. Create your JSON file following this enhanced structure
2. Go to the quiz questions page
3. Click "📥 Import JSON" 
4. Select your JSON file
5. System validates enhanced fields
6. Questions imported with access control
7. System displays enhanced analytics:
   - Free vs Paid question breakdown
   - Difficulty distribution
   - Question parts structure
   - Total marks and time estimates

## Enhanced Analytics Display

After upload, the system shows:
- **Access Control**: Free/Paid question counts
- **Question Structure**: Main questions vs sub-parts
- **Difficulty Distribution**: Beginner/Intermediate/Advanced breakdown
- **Time Estimates**: Total duration and per-question allocation
- **Academic Metrics**: Total marks and learning objectives

## Validation Rules

### Enhanced Validations
1. **Version Format**: Must follow semantic versioning
2. **Access Control**: isFree must be boolean
3. **Question Parts**: part field must be valid format
4. **Difficulty Levels**: Must be BEGINNER, INTERMEDIATE, or ADVANCED
5. **Time Allocation**: Must be positive number
6. **Question Relationships**: subQuestion must match part field

### Legacy Compatibility
- Old templates without new fields will use defaults
- Missing fields are automatically populated
- Backward compatibility maintained

## Common Issues and Solutions

### Access Control Issues
- **All questions showing as free**: Check defaultIsFree and individual isFree values
- **Mixed access not working**: Ensure isFree explicitly set for each question

### Question Parts Issues
- **Parts not displaying correctly**: Verify part field format matches examples
- **Sub-questions not grouped**: Check mainQuestion numbering consistency

### Version Control Issues
- **Version conflicts**: Ensure questionVersion follows semantic versioning
- **Missing change logs**: Add changeLog for tracking modifications

## Best Practices

### Question Organization
1. Use clear questionId naming: "q_topic_number"
2. Set hasSubQuestions=true for main questions with parts
3. Use consistent part naming (A,B,C or i,ii,iii)
4. Set appropriate mainQuestion references

### Access Control
1. Default to paid for premium content
2. Offer free samples for user engagement
3. Balance free/paid ratio based on strategy
4. Use difficulty levels to justify pricing

### Version Management
1. Track all changes in changeLog
2. Update lastModified dates consistently
3. Use semantic versioning for templates
4. Document breaking changes clearly

## Support

For issues with enhanced features:
- Check browser console for validation errors
- Verify all servers are running properly
- Ensure JSON structure matches examples
- Review access control settings if questions not displaying correctly

The enhanced system provides comprehensive quiz management with professional-grade features for educational content delivery.
