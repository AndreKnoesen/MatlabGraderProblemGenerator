import React from 'react';
import type { AppState, Artifacts, ReviewTab } from '../types';
import { Button, Card, DifficultyBadge, ProblemTypeBadge } from './Common';
import { downloadText, toSnakeCase } from '../api';
import { CheckCircle, Download } from 'lucide-react';

interface Props {
  state: AppState;
  onStartOver: () => void;
}

const FILE_CONFIG: { key: ReviewTab; getFilename: (title: string) => string; label: string }[] = [
  { key: 'description', label: '*_description.txt', getFilename: t => `${toSnakeCase(t)}_description.txt` },
  { key: 'solution',    label: 'solution.m',        getFilename: _  => 'solution.m' },
  { key: 'template',    label: 'template.m',        getFilename: _  => 'template.m' },
  { key: 'tests',       label: 'all_tests.m',       getFilename: _  => 'all_tests.m' },
];

const Stage3Done: React.FC<Props> = ({ state, onStartOver }) => {
  const { generatedProblems } = state;

  const handleDownloadAll = (artifacts: Artifacts, title: string) => {
    FILE_CONFIG.forEach((f, i) => {
      setTimeout(() => downloadText(artifacts[f.key], f.getFilename(title)), i * 200);
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Success banner */}
      <div className="flex items-center gap-3 bg-[#e2efda] border border-[#a9d08e] rounded-lg p-5">
        <CheckCircle className="text-brand-green flex-shrink-0" size={28} />
        <div>
          <h2 className="text-lg font-bold text-[#375623]">
            Generated {generatedProblems.length} problem{generatedProblems.length !== 1 ? 's' : ''} successfully
          </h2>
          <p className="text-sm text-[#375623] mt-0.5">
            Download the artifacts below and paste them into MATLAB Grader.
          </p>
        </div>
      </div>

      {/* Per-problem download sections */}
      {generatedProblems.map(({ option, artifacts }, idx) => (
        <Card key={idx} className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-bold text-gray-800">{idx + 1}. {option.title}</span>
            <DifficultyBadge difficulty={option.difficulty} />
            <ProblemTypeBadge type={option.problem_type} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {FILE_CONFIG.map(f => (
              <button
                key={f.key}
                onClick={() => downloadText(artifacts[f.key], f.getFilename(option.title))}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200
                           hover:border-brand-accent hover:bg-brand-light transition-colors text-xs
                           font-medium text-gray-700 hover:text-brand-dark"
              >
                <Download size={16} className="text-brand-accent" />
                <span className="text-center leading-tight">{f.label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadAll(artifacts, option.title)}
          >
            ↓ Download All 4 Files
          </Button>
        </Card>
      ))}

      {/* Paste instructions */}
      <Card className="p-4 bg-brand-light border-brand-accent">
        <p className="text-xs font-semibold text-brand-dark mb-2">How to use in MATLAB Grader</p>
        <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
          <li>Paste <strong>*_description.txt</strong> into the Problem Description tab</li>
          <li>Paste <strong>solution.m</strong> into the Reference Solution tab</li>
          <li>Paste <strong>template.m</strong> into the Learner Template tab</li>
          <li>Copy each <code className="bg-white px-1 rounded">% === TEST N ===</code> section from <strong>all_tests.m</strong> into a separate Test Case</li>
        </ol>
      </Card>

      <div className="flex justify-center pt-2">
        <Button variant="secondary" size="lg" onClick={onStartOver}>
          ↺ Start Over
        </Button>
      </div>
    </div>
  );
};

export default Stage3Done;
