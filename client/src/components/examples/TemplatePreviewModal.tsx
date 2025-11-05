import { useState } from 'react';
import TemplatePreviewModal from '../TemplatePreviewModal';
import { Button } from '@/components/ui/button';
import { surveyTemplates } from '@shared/templates';

export default function TemplatePreviewModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Template Preview</Button>
      <TemplatePreviewModal 
        template={surveyTemplates[0]}
        open={open}
        onOpenChange={setOpen}
        onUse={() => {
          console.log('Use template');
          setOpen(false);
        }}
      />
    </div>
  );
}
