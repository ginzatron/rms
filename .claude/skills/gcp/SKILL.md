---
name: gcp
description: Git commit and push - analyzes changes, groups into logical commits, and pushes
---

# Git Commit & Push (gcp)

Analyze all changed files, group them into logical separate commits with appropriate messages, create all commits, and push to remote.

## Workflow

### 1. Analyze Changes

Run these commands to understand all changes:

```bash
git status
git diff --stat
git diff --stat --cached
```

### 2. Group Changes Logically

Analyze the changed files and group them by:

**Grouping Priority:**
1. **Feature/Component** - Files that implement the same feature belong together
2. **Layer** - Backend vs frontend vs database vs config
3. **Change Type** - New feature, bugfix, refactor, docs, tests, config

**Common Groups:**
- `feat: ...` - New features or capabilities
- `fix: ...` - Bug fixes
- `refactor: ...` - Code restructuring without behavior change
- `docs: ...` - Documentation only
- `test: ...` - Test additions or fixes
- `chore: ...` - Build, config, dependencies
- `style: ...` - Formatting, whitespace (no code change)

**Rules:**
- Keep related changes together (e.g., a component + its tests + its types)
- Separate unrelated changes into different commits
- Database migrations should be their own commit
- Large refactors separate from feature work
- Config/dependency changes separate from code changes

### 3. Create Commits

For each logical group:

1. Stage only the files for that group:
   ```bash
   git add <specific-files>
   ```

2. Create commit with descriptive message:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>: <short description>

   <optional body explaining why/what>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

**Commit Message Guidelines:**
- First line: `<type>: <imperative description>` (max 72 chars)
- Body: Explain the "why" not the "what" (the diff shows what)
- Reference issues if applicable: `Fixes #123`

### 4. Push

After all commits are created:

```bash
git push
```

If the branch doesn't exist on remote:
```bash
git push -u origin <branch-name>
```

## Examples

### Example 1: Mixed Frontend + Backend Changes

**Changed files:**
- `frontend/src/App.tsx`
- `frontend/src/components/Button.tsx`
- `src/index.ts`
- `src/routes/users.ts`
- `README.md`

**Commits:**
1. `feat(api): add user management endpoints` - backend files
2. `feat(frontend): add Button component and update App` - frontend files
3. `docs: update README` - documentation

### Example 2: Feature + Refactor Mixed

**Changed files:**
- `src/auth.ts` (new feature)
- `src/utils.ts` (refactored)
- `src/types.ts` (updated for both)

**Commits:**
1. `refactor: simplify utils helper functions` - utils changes
2. `feat: add authentication module` - auth + related type changes

## Important

- Never use `git add .` or `git add -A` - always stage specific files
- Review each group before committing to ensure coherence
- If unsure about grouping, prefer fewer larger commits over many tiny ones
- Always include the Co-Authored-By line
