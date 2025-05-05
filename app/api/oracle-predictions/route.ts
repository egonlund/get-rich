import { PredictionsRequest } from '@/types/OraclePredictions';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request): Promise<Response> {
    const body = await req.json();

    if (!body.topic || !Array.isArray(body.salaryData)) {
        return new Response(JSON.stringify({ error: 'Missing or invalid input.' }), { status: 404 });
    }

    const { topic, salaryData }: PredictionsRequest = body;

    const prompt = `
Töövaldkonna "${topic}" töötaja soovib prognoosi alates ${new Date().getFullYear()}. aastast.
Sisendandmed (aasta, töötasu):\n${salaryData.map(salary => `${salary.year}: ${salary.value} €`).join('\n')}

Tagasta JSON kujul
{
  "predictions": [
    { "year": string, "value": number }
  ],
  "suggestions": [
    string
  ],
  "trend": string
}

kus "predictions" väli on töötasu prognoos 3 järgmise aasta kohta; "suggestions" väli on 3 lühikest soovitust, mis oskusi töötaja peab arendama, et palgatõusu saavutada; "trend" väli kirjeldab lühidalt valdkonna arengut.
  `;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { "type": "json_object" },
        messages: [
            {
                role: 'system',
                content: 'Sa oled töövaldkondade ja palgaturu analüütik, kes mõistab erinevate valdkondade töötaja oskuste arengut ja palgatrende'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7
    });
    const raw = completion.choices[0]?.message.content;
    try {
        const parsed = JSON.parse(raw || '');
        if (!parsed?.predictions || !parsed?.suggestions || !parsed?.trend) {
            return new Response(JSON.stringify({ error: 'Invalid response format from OpenAI' }), { status: 500 });
        }
        return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({
            error: `Incorrect JSON from OpenAI, error: ${err}`, raw
        }), { status: 500 });
    }
}