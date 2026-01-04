import fs from 'fs';

const content = `DATABASE_URL="postgresql://Postgres:6715320Dvd@localhost:5432/biblia-estudio?sslmode=disable"
JWT_SECRET="super_secret_jwt_key_blessed_2026"
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453"
PAYPAL_CLIENT_ID="BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4"
PAYPAL_CLIENT_SECRET="EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:8080"
BACKEND_URL="http://localhost:3000"

VITE_API_BASE_URL=/api
VITE_OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
VITE_OLLAMA_MODEL=gemma2:2b
VITE_USE_OLLAMA=true

VITE_GROQ_API_KEY=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
VITE_GROQ_API_KEY_2=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
VITE_GROQ_API_KEY_3=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
VITE_GROQ_API_KEY_4=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
GROQ_API_KEY=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
VITE_GROQ_MODEL=llama-3.1-8b-instant
`;

fs.writeFileSync('server/.env', content, { encoding: 'utf8' });
console.log('✅ server/.env written cleanly');
