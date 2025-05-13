import React, { memo } from 'react';
import Button from '../../ui/redesign/Button';
import StatusBadge from '../../ui/redesign/StatusBadge';
import { ChevronRight } from 'lucide-react';

const TreatmentCard = memo(({
  icon: Icon,
  title,
  status,
  details,
  progress,
  primaryButtonText,
  onPrimaryAction,
  onViewDetails
}) => (
  <div className={"bg-white rounded-xl shadow-sm overflow-hidden mb-4 border-l-4 " + (title.includes('Hair') ? 'border-purple-500' : 'border-teal-500') + ' card-hover'}>
    <div className="p-4 flex items-center">
      <div className={"w-10 h-10 rounded-full " + (title.includes('Hair') ? 'bg-purple-100' : 'bg-teal-100') + ' flex items-center justify-center mr-3 flex-shrink-0'}>
        <Icon className={"h-5 w-5 " + (title.includes('Hair') ? 'text-purple-500' : 'text-teal-600')} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <StatusBadge status={status} variant="success" />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {details}
          </p>
          {progress && <p className={"text-sm font-semibold " + (progress.includes('-') ? 'text-green-600' : 'text-gray-600')}>{progress}</p>}
        </div>
      </div>
      <button
        className="ml-2 text-gray-400 hover:text-gray-600"
        onClick={onViewDetails}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>

    <div className="px-4 py-3 border-t border-gray-100">
      <div className="flex">
        <div className="flex-1 pr-2">
          <Button
            variant="primary"
            fullWidth
            onClick={onPrimaryAction}
          >
            {primaryButtonText}
          </Button>
        </div>
        <div className="flex-1 pl-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  </div>
));

export default TreatmentCard;
