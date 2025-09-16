import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';

type Bindings = {
	OPEN_AI_KEY: string;
	AI: Ai;
};
const app = new Hono<{ Bindings: Bindings }>();

app.use(
	'/*',
	cors({
		origin: '*', // Allow reuests for your next.js app
		allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
		allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true,
	})
);

app.post('/chatToDocument', async (c) => {
	try {
		const client = new OpenAI({
			apiKey: c.env.OPEN_AI_KEY,
		});

		const { documentData, question } = await c.req.json();

		if (!documentData || !question) {
			return c.json({ error: 'Missing documentData or question' }, 400);
		}

		// === Chat part ===
		const completions = await client.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content:
						'You are an assistant helping the user to chat with a document. ' +
						'You will be provided a JSON file of the markdown. ' +
						'Answer the question clearly. ' +
						'Document: ' +
						JSON.stringify(documentData),
				},
				{
					role: 'user',
					content: 'My question is: ' + question,
				},
			],
		});

		const response = completions.choices[0].message?.content ?? '';
		console.log('Chat response:', response);

		// === Fine-tuning debug part ===
		try {
			const job = await client.fineTuning.jobs.create({
				// ⚠️ gpt-4o does NOT support fine-tuning
				model: 'gpt-3.5-turbo',
				training_file: 'file-abc123', // replace with a real uploaded file ID
			});

			console.log('Fine-tune job:', job);
		} catch (err) {
			if (err instanceof OpenAI.APIError) {
				console.error('Fine-tune API error:');
				console.error('Status:', err.status);
				console.error('Name:', err.name);
				console.error('Headers:', err.headers);
				console.error('Error body:', err.error);
			} else {
				console.error('Unexpected fine-tune error:', err);
			}
		}

		// return the chat response regardless
		return c.json({ message: response });
	} catch (err) {
		console.error('Error in /chatToDocument:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.post('/translateDocument', async (c) => {
	const { documentData, targetLang } = await c.req.json();

	// Generate a summary of the Document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	// translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		target_lang: targetLang,
	});

	return new Response(JSON.stringify(response));
});

export default app;
