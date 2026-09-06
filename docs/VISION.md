# Both AI - #édecasa do BEM 💚

## 🎯 Missão
**Helping do bem, de casa** - Uma IA que faz diferença no dia a dia, de forma genuína e acessível.

Não é só fumaça. É ferramenta que realmente funciona.

---

## 💡 Casos de Uso Reais

### 1. **Organizador de Tarefas Domésticas**
```bash
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -d '{"input": "Preciso organizar as tarefas da casa para semana"}'
```

**Resposta:**
```json
{
  "success": true,
  "input": "Preciso organizar as tarefas da casa para semana",
  "processed": true,
  "timestamp": "2026-09-05T12:00:00.000Z"
}
```

---

### 2. **Planejador de Refeições**
```bash
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -d '{"input": "Quero receitas fáceis pra fazer em casa"}'
```

---

### 3. **Assistente de Bem-estar**
```bash
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -d '{"input": "Dicas de rotina matinal saudável"}'
```

---

## 🏗️ Arquitetura

```
Both AI v1
├── API REST (Express.js)
├── Health Check
├── Service Status
├── Processing Engine
└── Error Handling
```

---

## 🧪 Testes

**Rodar testes:**
```bash
npm test
```

**Testes inclusos:**
- ✅ Health Check (200 OK)
- ✅ Service Status
- ✅ Process com input válido
- ✅ Process com input inválido
- ✅ Erro 404
- ✅ Content-Type validation

---

## 🚀 Deploy

### Docker
```bash
docker-compose up -d
```

### Manual
```bash
npm install
npm start
```

---

## 📊 Roadmap

- ✅ v1.0.0 - Base operacional
- 🔄 v1.1.0 - Features específicas
- 🔄 v2.0.0 - Escalabilidade
- 🔄 v3.0.0 - Impacto social

---

## 💚 Valores

- **Transparência** - Código aberto, sem segredos
- **Acessibilidade** - Fácil de usar, fácil de entender
- **Impacto** - Faz diferença na vida das pessoas
- **Sustentabilidade** - Crescimento responsável
- **Comunidade** - Feito com e para as pessoas

---

**Both AI: Helping do bem, de casa** 💚
