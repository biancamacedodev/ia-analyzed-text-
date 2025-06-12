const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());

// Configuração do rate limiter (limite de 10 requisições por minuto)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10,
  message: { error: 'Muitas requisições. Aguarde um minuto e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

let saveAnalysis = {
    text: '',
    words: [],
};

function analyzeText(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopwords = ['de', 'a', 'o', 'e', 'que', 'do', 'da', 'em', 'um', 'para'];
    const filtered = words.filter(w => !stopwords.includes(w));

    const freq = {};
    filtered.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const top5 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([word, count]) => ({ word, count }));

    return { wordCount: words.length, top5Words: top5, allWords: words };
}

async function getSentimentFromChatGpt(text) {
    const prompt = `Analise o sentimento do seguinte texto e retorne apenas uma palavra: "POSITIVO", "NEUTRO" ou "NEGATIVO". Texto: """${text}"""`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
        });

        return response.choices[0].message.content.trim().toUpperCase();
    } catch (error) {
        throw error;
    }
}

// Aplicando rate limiter somente nessa rota
app.post('/analyze-text', limiter, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Texto não fornecido' });

    const statusText = analyzeText(text);

    try {
        const sentiment = await getSentimentFromChatGpt(text);

        saveAnalysis = {
            text,
            words: statusText.allWords,
        };

        res.json({
            wordCount: statusText.wordCount,
            topWords: statusText.top5Words,
            sentiment,
        });
    } catch (error) {
        console.error('Erro ao chamar a OpenAI:', error.response?.data || error.message || error);
        res.status(500).json({
            wordCount: statusText.wordCount,
            topWords: statusText.top5Words,
            sentiment: {
                analysis: 'Não foi possível analisar o sentimento do texto.',
                error: error.response?.data || error.message || error.toString()
            }
        });
    }
});

app.get('/search-term', (req, res) => {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'Termo não informado' });

    const found = saveAnalysis.words.includes(term.toLowerCase());
    res.json({ found, text: saveAnalysis.text });
});

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));

