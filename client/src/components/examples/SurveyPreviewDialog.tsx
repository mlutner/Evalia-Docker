import { useState } from 'react';
import SurveyPreviewDialog from '../SurveyPreviewDialog';
import { Button } from '@/components/ui/button';
import { surveyTemplates } from '@shared/templates';

export default function SurveyPreviewDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Survey Preview</Button>
      <SurveyPreviewDialog 
        questions={surveyTemplates[0].questions}
        title={surveyTemplates[0].title}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
