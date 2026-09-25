# المحادثة الذكية

واجهة محادثة بسيطة مع Claude مبنية بـ Next.js و TypeScript.

## التشغيل

```bash
pnpm install
cp .env.example .env.local   # ثم ضع ANTHROPIC_API_KEY
pnpm dev
```

افتح http://localhost:3000

## الملفات

- `app/chat-ui.tsx` — واجهة المحادثة
- `app/api/chat/route.ts` — الاتصال بـ Claude من الخادم (المفتاح لا يصل للمتصفح)
