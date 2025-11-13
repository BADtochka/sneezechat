import type { Plugin } from 'vite';

export default function telegramPlugin(): Plugin {
  return {
    name: 'startup-plugin',
    apply: 'serve', // literal type, теперь корректно
    configureServer() {
      console.log('🚀 Vite dev server starting...');

      // Асинхронная инициализация — без ожидания блокировки старта
      (async () => {
        try {
          const mod = await import('../server/telegram');
          if (mod.telegramBot) {
            await mod.telegramBot();
            console.log('✅ Telegram bot started successfully');
          } else {
            console.warn('⚠️ telegramBot() not found in module');
          }
        } catch (err) {
          console.error('❌ Failed to start Telegram bot:', err);
        }
      })();
    },
  };
}
