import SurveyCard from '../SurveyCard';

export default function SurveyCardExample() {
  const survey = {
    id: '1',
    title: 'Training Effectiveness Survey Q4 2024',
    createdAt: new Date().toISOString(),
    responseCount: 42,
    questionCount: 12
  };

  return (
    <div className="p-8 max-w-sm">
      <SurveyCard 
        survey={survey}
        onView={() => console.log('View survey')}
        onAnalyze={() => console.log('Analyze survey')}
        onExport={() => console.log('Export survey')}
        onDelete={() => console.log('Delete survey')}
      />
    </div>
  );
}
