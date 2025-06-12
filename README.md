# Text Analyzed AI

API Node.js para análise de texto, contagem de palavras, identificação das palavras mais frequentes e análise de sentimento usando a OpenAI.

## Funcionalidades
- Conta o número de palavras em um texto enviado.
- Retorna as 5 palavras mais frequentes (ignorando stopwords).
- Analisa o sentimento do texto (positivo, neutro ou negativo) usando a API da OpenAI.
- Limita o número de requisições para evitar abuso (10 requisições por minuto).

## Pré-requisitos
- Node.js >= 14
- Conta e chave de API da OpenAI

## Instalação

```bash
npm install
```

## Configuração
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
OPENAI_API_KEY=your_openai_api_key_aqui
```

Substitua `your_openai_api_key_aqui` pela sua chave da OpenAI.

## Como rodar

```bash
node index.js
```
A API estará disponível em `http://localhost:3000`.

## Rotas

### `POST /analyze-text`
Recebe um JSON com o campo `text` e retorna a análise.

**Exemplo de requisição:**
```json
{
  "text": "Seu texto aqui para análise."
}
```

**Resposta:**
```json
{
  "wordCount": 5,
  "topWords": [
    { "word": "exemplo", "count": 2 },
    ...
  ],
  "sentiment": "POSITIVO"
}
```

### `GET /search-term?term=palavra`
Verifica se uma palavra está presente no último texto analisado.

**Resposta:**
```json
{
  "found": true,
  "text": "Texto analisado anteriormente."
}
```

## Limite de Requisições
Cada IP pode fazer até 10 requisições por minuto. Após isso, será retornado um erro:
```json
{
  "error": "Muitas requisições. Aguarde um minuto e tente novamente."
}
```

## Observações
- O projeto não armazena textos analisados de forma persistente, apenas mantém o último texto em memória.

