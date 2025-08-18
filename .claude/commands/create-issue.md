---
description:
  'Create a GitHub issue with proper formatting, labels, and todo checklist
  based on current changes or development description'
argument-hint: '[title] [description]'
allowed-tools: [Bash, TodoWrite, Read, Grep]
---

# Create GitHub Issue

Create a GitHub issue automatically with intelligent formatting, appropriate
labels, and structured todo checklists based on your current changes or
development needs.

Arguments:

- `title` (optional): Issue title (auto-generated from changes if not provided)
- `description` (optional): Issue description (analyzed from git changes if not
  provided)

## Process

I'll handle the following steps automatically:

1. **Analysis**:
   - Analyze current git changes and uncommitted files
   - Identify the type of work (feature, bug, enhancement, docs, etc.)
   - Generate appropriate issue title and description
   - Extract relevant code context and file references

2. **Issue Generation**:
   - Create structured issue description with:
     - Clear problem/feature description
     - Acceptance criteria and todo checklist
     - Related files and code references
     - Technical considerations
   - Auto-assign appropriate labels based on content:
     - `enhancement`, `bug`, `documentation`, `testing`
     - `frontend`, `backend`, `mobile`, `extension` (based on affected files)
     - `priority-high`, `priority-medium`, `priority-low`

3. **Smart Labeling**:
   - Analyze file changes to determine component areas
   - Detect issue type from commit messages and file patterns
   - Apply appropriate priority based on change scope

4. **Integration Features**:
   - Store issue number for later PR linking
   - Support milestone assignment
   - Enable issue templates for consistency

## Usage Examples:

- `/create-issue` - Auto-generate from current changes
- `/create-issue "Add dark mode support"` - Custom title with auto description
- `/create-issue "Fix login bug" "Users can't login on mobile devices"`

Let me create your GitHub issue with: **$ARGUMENTS**
