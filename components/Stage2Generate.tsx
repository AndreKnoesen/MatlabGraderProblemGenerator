import React from 'react';
import type { AppState, ReviewTab, Artifacts } from '../types';
import {
  Button, Card, CodeViewer, LogPanel, ErrorPanel, StepChecklist,
} from './Common';
import { downloadText, downloadZip, toSnakeCase } from '../api';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
  onRetry: () => void;
}

const TAB_CONFIG: { key: ReviewTab; label: string; getFilename: (title: string) => string }[] = [
  { key: 'description', label: 'Description',  getFilename: t => `${toSnakeCase(t)}_description.txt` },
  { key: 'solution',    label: 'Solution',      getFilename: _  => 'solution.m' },
  { key: 'template',    label: 'Template',      getFilename: _  => 'template.m' },
  { key: 'tests',       label: 'Tests',         getFilename: _  => 'all_tests.m' },
];

const Stage2Generate: React.FC<Props> = ({ state, setState, onNext, onRetry }) => {
  const {
    stage, options, selectedIds, currentProblemIdx,
    generatingStep, logs, error, activeReviewTab, generatedProblems,
  } = state;

  const selectedProblems = options.filter(o => selectedIds.includes(o.id));
  const total = selectedProblems.length;
  const current = selectedProblems[currentProblemIdx];
  const progressPercent = total > 0 ? Math.round(((currentProblemIdx) / total) * 100) : 0;
  const isReview = stage === 'review';
  const isLastProblem = currentProblemIdx >= total - 1;

  // The artifacts for the current problem in review
  const reviewedProblem = isReview
    ? generatedProblems[generatedProblems.length - 1]
    : null;

  const handleDownloadAll = (artifacts: Artifacts, title: string) => {
    const files = TAB_CONFIG.map(tab => ({
      filename: tab.getFilename(title),
      content: artifacts[tab.key],
    }));
    downloadZip(files, `${toSnakeCase(title)}.zip`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-brand-dark">
            {isReview ? '✓ ' : ''}{current?.title ?? 'Generating...'}
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            Problem {currentProblemIdx + 1} of {total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${isReview ? ((currentProblemIdx + 1) / total) * 100 : progressPercent}%` }}
          />
        </div>
      </div>

      {/* Generating view */}
      {!isReview && (
        <Card className="p-6 space-y-5">
          <StepChecklist currentStep={generatingStep} />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              API Log
            </p>
            <LogPanel logs={logs} />
          </div>
          {error && <ErrorPanel message={error} onRetry={onRetry} />}
        </Card>
      )}

      {/* Review view */}
      {isReview && reviewedProblem && (
        <Card className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.key}
                onClick={() => setState(s => ({ ...s, activeReviewTab: tab.key }))}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeReviewTab === tab.key
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          {TAB_CONFIG.map(tab => {
            if (tab.key !== activeReviewTab) return null;
            const content = reviewedProblem.artifacts[tab.key];
            const filename = tab.getFilename(reviewedProblem.option.title);
            return (
              <CodeViewer
                key={tab.key}
                filename={filename}
                content={content}
                onDownload={() => downloadText(content, filename)}
              />
            );
          })}

          {/* Log (collapsed) */}
          <details className="text-xs">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-600">
              Show API log
            </summary>
            <div className="mt-2">
              <LogPanel logs={logs} />
            </div>
          </details>

          {/* Download all + Next */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => handleDownloadAll(reviewedProblem.artifacts, reviewedProblem.option.title)}
            >
              ↓ Download All 4 Files
            </Button>
            <Button variant="primary" size="lg" onClick={onNext}>
              {isLastProblem ? 'Finish →' : 'Next Problem →'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Stage2Generate;
