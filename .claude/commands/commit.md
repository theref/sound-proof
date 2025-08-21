# Prepare Atomic Git Commits

Analyze the current git repository state and prepare **atomic commits** - each commit should represent one logical, complete change that can stand alone.

## Usage

`/commit`

## Atomic Commit Philosophy

**Each commit must be:**
- ✅ **Complete** - implements one full logical change
- ✅ **Self-contained** - can be reverted without breaking anything
- ✅ **Focused** - addresses only one concern/feature/fix
- ✅ **Reviewable** - small enough to understand quickly
- ✅ **Testable** - passes all tests on its own

## Process

1. **Run Quality Checks**:
   - `npm run lint` - verify code style
   - `npx tsc --noEmit` - check TypeScript
   - `npm run build` - ensure build works

2. **Analyze Changes & Create Atomic Commits**:
   - Run `git status` and `git diff`
   - **SPLIT changes by logical units** - never mix unrelated changes
   - Each commit should tell a complete story
   - Group related file changes together
   - Review recent commit history for style

3. **Create Focused Commit Messages**:
   - Follow format: `type(scope): description`
   - Use imperative mood ("add", not "added")
   - Keep first line ≤ 72 characters
   - **Each message describes ONE complete change**
   - Commits reference issues using `#issue_number` and close those issues if appropriate

4. **Show Atomic Commit Plan** (don't execute until confirmed)
5. **Execute if Confirmed**

## Commit Types

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | ✨ | New feature |
| `fix` | 🐛 | Bug fix |
| `docs` | 📝 | Documentation |
| `style` | 💄 | Code formatting |
| `refactor` | ♻️ | Code refactor |
| `perf` | ⚡️ | Performance improvement |
| `test` | ✅ | Add/update tests |
| `chore` | 🔧 | Build, deps, tooling |
| `ci` | 🚀 | CI/CD changes |

## Scopes

Use these scopes for SoundProof:
- `auth` - Farcaster authentication
- `upload` - Track upload functionality
- `player` - Audio playback
- `ui` - User interface components
- `storage` - Data persistence
- `api` - API integrations
- `deploy` - Deployment configuration

## Examples

```
✨ feat(auth): add Farcaster sign-in with username modal
🐛 fix(upload): correct file input padding alignment
📝 docs: add production deployment guide
🔧 chore(deploy): configure Vercel auto-deployment
```

## ALWAYS Split Changes When They Differ By:

- **Concern** - unrelated functionality (auth + upload = 2 commits)
- **Type** - feature vs fix vs docs (never mix in one commit)
- **Scope** - different parts of the app (UI + API = separate commits)
- **Purpose** - setup vs implementation vs documentation
- **Size** - large changes should be broken into logical steps

## Anti-Patterns to Avoid:

❌ **"feat: add auth and fix upload bug"** - mixes feature + fix
❌ **"chore: update deps, fix tests, add docs"** - mixes 3 concerns
❌ **"refactor: entire component rewrite"** - too large, break into steps

✅ **Good atomic commits:**
- `✨ feat(auth): add Farcaster username input modal`
- `🐛 fix(upload): correct file input padding alignment`
- `📝 docs: add deployment guide for Vercel`
