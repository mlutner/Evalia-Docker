import TemplateCard from '../TemplateCard';
import { surveyTemplates } from '@shared/templates';

export default function TemplateCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <TemplateCard 
        template={surveyTemplates[0]}
        onPreview={() => console.log('Preview template')}
        onUse={() => console.log('Use template')}
      />
    </div>
  );
}
