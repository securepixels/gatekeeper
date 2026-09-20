# Gatekeeper

A client-side prompt injection scanner that analyzes LLM inputs for manipulation patterns before they reach a model. Runs entirely in the browser. Nothing gets sent anywhere.

## What it does

Paste a prompt and Gatekeeper scans it against 21 detection rules across 7 attack categories:

- **Role Hijacking** - instruction overrides, persona reassignment, DAN/jailbreak keywords, developer mode claims
- **Data Exfiltration** - system prompt extraction, conversation history dumps, training data probes
- **Delimiter Abuse** - fake system tags, instruction boundary markers, code block injection
- **Encoding Tricks** - base64 payloads, character splitting, reverse text instructions
- **Indirect Injection** - embedded instructions in data, hidden/invisible text techniques
- **Context Manipulation** - hypothetical framing, false authority claims, emotional pressure
- **Output Manipulation** - suppressed safety disclaimers, forced compliance patterns

Each finding includes a severity rating, the matched text highlighted inline, an explanation of why the pattern is dangerous, and an OWASP LLM Top 10 reference.

## How it works

The interface is built with a terminal aesthetic. Type or paste a prompt, hit scan, and results render as structured log entries sorted by severity. Risk score scales from 0 (clean) to 100 (critical).

Sample prompts are included so you can see the scanner in action without writing your own test cases.

## Tech stack

- Next.js (React)
- Vanilla JavaScript rules engine
- Deployed on Vercel
- Zero external dependencies or API keys

## Run locally

```bash
git clone https://github.com/securepixels/gatekeeper.git
cd gatekeeper
# Open index.html in your browser, or:
npx serve .
```


