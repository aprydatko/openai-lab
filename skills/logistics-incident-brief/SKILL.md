---
name: logistics-incident-brief
description: Use when the user wants a short logistics incident brief from a local incident note. Read the incident file, extract the key facts, risks, and next actions, then produce a concise markdown brief.
---

# Logistics Incident Brief

Use this skill to turn a raw incident note into a compact operational brief.

## Workflow

1. Read the incident file provided by the user.
2. Identify:
   - incident summary
   - current impact
   - immediate risks
   - recommended next actions
3. Format the output as markdown using this structure:

```md
# Incident Brief

## Summary
- ...

## Impact
- ...

## Risks
- ...

## Next actions
- ...
```

## Rules

- Stay grounded in the file contents.
- Do not invent timestamps, people, or cargo details.
- If something is unclear, state that it is unclear.
- Keep the brief short and operational.
