# Coding Rules

## Language
- TypeScript strict mode, no `any`
- Prefer functional programming, avoid classes when not needed

## Naming
- File: kebab-case (`user-service.ts`)
- Function / Variable: camelCase
- Type / Interface: PascalCase, prefix `I` for interfaces (`IUserResponse`)
- Constant: UPPER_SNAKE_CASE
- Component: PascalCase (`UserProfile.tsx`)
- Database table: plural snake_case (`order_items`)

## File Structure
- 1 function = 1 job, max 30 lines
- 1 file max 200 lines, split if longer
- Export from index.ts, no direct imports of child files

## Import Order
1. Node.js builtins (`fs`, `path`)
2. External packages (`@nestjs/*`, `react`)
3. Internal packages (`@myapp/shared`)
4. Relative imports (`./`, `../`)
5. Styles / assets

## Error Handling
- Always use custom error classes, never throw strings
- API responses always wrapped in `{ data, error, meta }`
- Log errors with full context (userId, action, input)

## Testing
- Unit tests for every function with logic
- Test file next to source: `user.service.ts` → `user.service.spec.ts`
- Mock external deps, don't mock internal logic
- Minimum coverage: 80%

## Git
- Commit format: `type(scope): message`
- Types: feat, fix, refactor, test, docs, chore
- Scope: app or package name (`api`, `site`, `shared`)
- 1 commit = 1 logical change
- Don't commit generated files, build output, node_modules

## Comments
- JSDoc for public API / exported functions
- Don't comment obvious code
- TODO format: `// TODO(username): description`
