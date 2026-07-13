# Skill: Code Review

Checklist for reviewing code in the MyApp monorepo:

- [ ] Follows code style ([CODE-STYLE.md](../../Rules/Coder/CODE-STYLE.md))
- [ ] Includes accompanying tests ([TESTING.md](../../Rules/Coder/TESTING.md))
- [ ] No duplication of logic already in `packages/shared`
- [ ] API changes come with updated endpoint docs
- [ ] DB migration included if the schema changes
- [ ] Commit message follows the `type(scope): message` format
