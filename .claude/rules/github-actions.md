# GitHub Actions CI/CD Rules

## Security
- Pin ALLE actions op volledige SHA hashes, NOOIT op tags
  - GOED: `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`
  - FOUT: `uses: actions/checkout@v4`
- Stel altijd expliciete `permissions` blocks in — nooit defaults vertrouwen
- Valideer webhook signatures (HMAC-SHA256) — nooit overslaan
- Sla secrets op in GitHub Secrets, nooit hardcoded

## Performance
- Cache dependencies: `actions/setup-node` met `cache: 'npm'` (of yarn/pnpm)
- Gebruik `concurrency` groups om dubbele deploys te voorkomen
- Minimaliseer stappen met `if:` conditionals en path filters
- Stel timeouts in op zowel job- als step-niveau

## Betrouwbaarheid
- Valideer YAML syntax VOORDAT je wijzigingen voorstelt
- Gebruik environment protection rules voor production
- Implementeer retry-logica voor flaky network calls
- Check `github.event_name` bij conditionele workflows

## Pull Requests
- Schrijf betekenisvolle PR beschrijvingen: wat, waarom, hoe te testen
- Gebruik draft PRs voor work-in-progress
- Configureer CODEOWNERS correct
- Branch protection: required reviews + status checks + linear history
