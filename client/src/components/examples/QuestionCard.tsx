import QuestionCard from '../QuestionCard';

export default function QuestionCardExample() {
  const question = {
    id: '1',
    type: 'multiple_choice' as const,
    question: 'What is your primary training focus?',
    description: 'Select the option that best describes your work',
    options: [
      'Corporate Training',
      'Educational Institutions',
      'Personal Development',
      'Technical Skills',
      'Other'
    ],
    required: true
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <QuestionCard 
        question={question} 
        onAnswer={(answer) => console.log('Answer:', answer)} 
      />
    </div>
  );
}
