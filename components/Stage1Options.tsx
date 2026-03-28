import React from 'react';
import type { AppState, ProblemOption } from '../types';
import { Button, Card, DifficultyBadge, ProblemTypeBadge } from './Common';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onGenerate: () => void;
  onBack: () => void;
}

const Stage1Options: React.FC<Props> = ({ state, setState, onGenerate, onBack }) => {
  const { options, selectedIds, objective } = state;

  const toggle = (id: number) =>
    setState(s => ({
      ...s,
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter(x => x !== id)
        : [...s.selectedIds, id],
    }));

  const selectAll = () =>
    setState(s => ({ ...s, selectedIds: options.map(o => o.id) }));

  const deselectAll = () =>
    setState(s => ({ ...s, selectedIds: [] }));

  const allSelected = selectedIds.length === options.length && options.length > 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-brand-dark">Choose Problems to Develop</h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          <span className="font-medium text-gray-700">Objective:</span> {objective}
        </p>
      </div>

      {/* Select / Deselect all */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {selectedIds.length} of {options.length} selected
        </p>
        <button
          onClick={allSelected ? deselectAll : selectAll}
          className="text-sm text-brand-accent hover:underline"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Option cards */}
      <div className="space-y-3">
        {options.map((opt: ProblemOption) => {
          const selected = selectedIds.includes(opt.id);
          return (
            <Card
              key={opt.id}
              className={`p-4 cursor-pointer transition-all ${
                selected
                  ? 'border-brand-accent ring-1 ring-brand-accent'
                  : 'hover:border-gray-300'
              }`}
              // clicking anywhere on the card toggles selection
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(opt.id)}
                  className="mt-1 accent-brand-accent flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {opt.id}. {opt.title}
                    </span>
                    <DifficultyBadge difficulty={opt.difficulty} />
                    <ProblemTypeBadge type={opt.problem_type} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{opt.brief_description}</p>
                  <p className="text-xs text-gray-400 italic">{opt.concept_focus}</p>
                </div>
              </label>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onGenerate}
          disabled={selectedIds.length === 0}
        >
          Generate {selectedIds.length > 0 ? selectedIds.length : ''} Selected Problem
          {selectedIds.length !== 1 ? 's' : ''} →
        </Button>
      </div>
    </div>
  );
};

export default Stage1Options;
