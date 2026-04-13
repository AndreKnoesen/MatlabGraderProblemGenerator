# CLAUDE.md — MatlabGraderApp

## Deployment

After any code change, always run both steps:

```bash
npm run deploy   # builds and pushes to gh-pages (updates the live site)
git push origin main  # pushes source to main
```

The live app is at **https://veriqai.github.io/MatlabGraderProblemGenerator/**.
`npm run deploy` is required for users to see changes — pushing to `main` alone does not update the site.

---

## Architecture

Single-page React app (Vite + TypeScript + Tailwind). No backend — the Anthropic API is
called directly from the browser using the user's own API key.

| File | Role |
|---|---|
| `types.ts` | All shared types: `ProblemType`, `ClassAssessment`, `AppState`, `ProblemOption`, `Artifacts` |
| `api.ts` | `callClaude()`, `parseJsonResponse()`, `downloadText()`, `downloadZip()`, `toSnakeCase()` |
| `prompts.ts` | All five prompt-builder functions (one per artifact) |
| `App.tsx` | State machine and 4-stage generation pipeline |
| `components/Stage0Input.tsx` | Problem type / assessment picker UI |
| `components/Stage1Options.tsx` | Generated option cards, select/deselect |
| `components/Stage2Generate.tsx` | Progress + artifact review tabs |
| `components/Stage3Done.tsx` | Final download page |
| `components/Common.tsx` | Shared UI primitives — `ProblemTypeBadge` has a colour per type |

---

## Generation pipeline

Each problem goes through 4 sequential Claude calls (steps visible in `App.tsx`):

1. **Description** — `buildDescriptionPrompt` → `*_description.txt`
2. **Solution** — `buildSolutionPrompt` → `solution.m`
3. **Template** — `buildTemplatePrompt(solution)` → `template.m`
4. **Tests** — `buildTestsPrompt(solution)` → `all_tests.m`

---

## Problem types

| Type | What the student submits | Key detail |
|---|---|---|
| Script | `.m` script | Variables assessed in workspace |
| Function | `.m` function | Inputs/outputs assessed directly |
| Class | `classdef ClassName.m` | Assessed via instantiation |
| Object usage | `.m` script | Provided supporting class; student writes script only |

### Class assessments (selected in Stage 0 when problem type = Class)

| Assessment | What gets blanked |
|---|---|
| Constructor — property assignment | `obj.prop = arg` lines in constructor |
| Constructor — computed property | Derived property line only |
| Instance method | Method body |
| Constant property | Value inside `properties (Constant)` block |
| Operator overloading | Overloaded operator method body |

### Object usage — solution.m format

`solution.m` contains two sections separated by `%%%` delimiters:

```
%%% SUPPORTING FILE: ClassName.m %%%
classdef ClassName
...
end
%%% STUDENT SCRIPT SOLUTION %%%
...script code...
```

The instructor pastes the class portion into MATLAB Grader → Supporting Files, and the
script portion into Reference Solution. `template.m` contains the script portion only.

---

## all_tests.m quality rules

These rules are enforced via prompt language in `buildTestsPrompt`. Every generated test file must:

- Use `%% Test N: description` section headers only — no `=== TEST N ===` banners.
- Contain exactly one `assessVariableEqual('expr', value)` per section.
- Use **1–3 lines of setup** max per section.
- Use `randperm(19)-10` when swap/transposition detection matters; `randi([lo,hi])` otherwise.
- Include at least one hardcoding-detection test (different numeric range from Test 1).
- **No** `try/catch`, `fprintf`, `if/else`, `whos`, `dir`, `script_ran` flags, or markdown fences.
- 3–5 tests maximum.

---

## Adding a new problem type or Class assessment

1. **`types.ts`** — add to `ProblemType` or `ClassAssessment` union.
2. **`components/Stage0Input.tsx`** — add radio option (new type) or table row (new assessment).
3. **`components/Common.tsx`** — add a colour entry to `ProblemTypeBadge.styles` if new type.
4. **`prompts.ts`** — add a branch in each of the five build functions.
5. Run `npm run deploy && git push origin main`.
