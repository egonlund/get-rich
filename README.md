# Palga Oraakel Paavo Prognoosid®

## Tech stack

* NextJS 15
* Design with Tailwind CSS
* Chart from [shadcn/ui](https://ui.shadcn.com/charts#bar-chart)
* zustand for storing predictions in localstorage to avoid excessive OpenAI requests
* Average monthly gross salaries from [Statistikaamet](https://andmed.stat.ee/en/stat/majandus__palk-ja-toojeukulu__palk__aastastatistika/PA103)


## Getting Started

1. Set `.env.local` your `OPENAI_API_KEY`
2. Run the development server:

```bash
pnpm dev
```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

or 

4. Visit deployed project

## Tips

### Clear "Local storage" storage to trigger OpenAI API requests

For example: Chrome

* Open DevTools -> Application -> Storage -> Local storage -> right click -> Clear
