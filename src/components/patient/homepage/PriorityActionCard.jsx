import React, { memo } from 'react';
import Button from '../../ui/redesign/Button';

const PriorityActionCard = memo(({ icon: Icon, title, description, buttonText, buttonVariant, onClick }) => (
  <div className={`p-3 border-l-4 border-${buttonVariant === 'warning' ? 'yellow' : 'teal'}-500 mx-3 mb-3 bg-white rounded-r-lg flex items-center card-hover`}>
    <div className={`w-10 h-10 rounded-full bg-${buttonVariant === 'warning' ? 'yellow' : 'teal'}-100 flex items-center justify-center mr-3 flex-shrink-0`}>
      <Icon className={`h-5 w-5 text-${buttonVariant === 'warning' ? 'yellow' : 'teal'}-600`} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    <Button
      variant={buttonVariant}
      size="small"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  </div>
));

export default PriorityActionCard;
