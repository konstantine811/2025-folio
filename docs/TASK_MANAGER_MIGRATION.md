# Перенесення Task Manager в окремий додаток

Окремий додаток створено в **`../task-manager`** (поруч з `3d-react-abc-folio`).

## Що вже зроблено

- Новий Vite + React + TS проєкт з маршрутами `/`, `/template`, `/daily/:id`, `/analytics`.
- Нижня навігація (без Dock), i18n з перекладами `task_manager` та `pages.task`.
- Placeholder-сторінки (TemplateTask, DailyTask, Analytics) — потрібно замінити на повну реалізацію.

## Що потрібно скопіювати та адаптувати

### 1. Типи та конфіги

| З портфоліо | В task-manager |
|-------------|----------------|
| `src/types/drag-and-drop.model.ts` | `src/types/drag-and-drop.model.ts` |
| `src/types/analytics/task-analytics.model.ts` | `src/types/analytics/task-analytics.model.ts` |
| `src/config/firebase.config.ts` (тільки task-колекції + auth/db) | `src/config/firebase.config.ts` |
| `src/config/data-config.ts` (DateTemplate) | `src/config/data-config.ts` |
| `src/config/calendar.config.ts` | `src/config/calendar.config.ts` |
| `src/config/task-analytics.config.ts` | `src/config/task-analytics.config.ts` |

### 2. Стор та сервіси

- `src/storage/task-manager/task-manager.ts` → `src/storage/task-manager/task-manager.ts`
- `src/services/firebase/taskManagerData.ts` → `src/services/firebase/taskManagerData.ts`
- Вся папка `src/services/task-menager/` → `src/services/task-menager/`

### 3. UI-компоненти (shadcn / ui-abc)

Скопіювати лише ті, які використовуються в task-manager і dnd:

- `src/components/ui/`: checkbox, button, label, tooltip, calendar, table, select, form, popover, dropdown-menu, toggle-group, scroll-area, sliding-number (якщо є), morphing-popover
- `src/components/ui-abc/`: dialog, drawer (custom-drawer), inputs (input-combobox, input-number), select (select-time), sound-hover-element, wrapper-hover-element, buttons (sound-button), dialog-agree, dialog (task/label-tooltip)
- `src/lib/utils.ts` — вже є
- Якщо використовуються: `src/config/styles.config.ts`, `src/config/sounds.ts`, `src/types/sound.ts`, `src/storage/hoverStore.ts` — або скопіювати, або спростити (без звуків/ховерів)

### 4. DND та контекст

- Вся папка `src/components/dnd/` → `src/components/dnd/`
- У імпортах замінити шляхи: залишити `@/` (alias вже налаштований).

### 5. Сторінки task-manager

- `src/components/page-partials/pages/task-manager/` (всі файли) → `src/pages/` та підпапки (наприклад `src/pages/daily-components/`, `src/pages/analytics-comonents/` тощо), **або** зберегти структуру `src/pages/task-manager/` і оновити імпорти в `src/config/routes.tsx`.

Рекомендація: скопіювати як `src/pages/` з підпапками (daily-components, template-components, analytics-comonents, future-task-components, chart, hooks), щоб не змішувати з простими page-компонентами.

### 6. Решта залежностей

- Workers: `src/workers/analyticsWorker` — скопіювати в task-manager і оновити імпорт у Analytics.
- Preloader: скопіювати `Preloader` або замінити на простий спіннер.
- Хуки: `useIsAdoptive`, `useHeaderSizeStore` — у новому додатку можна використати фіксований header size (наприклад 0) та простий хук для адаптиву.
- Firebase auth: скопіювати логін (екран / логіка) з портфоліо або використати той самий Firebase проєкт і той самий `useLogin`/AuthGuard.

### 7. Після копіювання в портфоліо

- Видалити маршрути task-manager з `src/config/router-config.tsx` (TASK_MANAGER, TASK_MANAGER_*; lazy-імпорти TaskManager, TemplateTask, DailyTask, TaskAnalytics; TASK_MANAGER_ROUTERS і відповідні Route).
- Видалити посилання на task-manager з навігації/меню (наприклад пункт "Task Manager" / "Менеджер завдань").
- За бажанням прибрати з перекладів ключі `pages.task-manager` та `pages.task`, а також весь блок `task_manager` (або залишити, якщо портфоліо буде лише посилатися на окремий додаток).

## Запуск окремого додатку

```bash
cd ../task-manager
npm install
cp .env.example .env   # додати VITE_FIREBASE_* з портфоліо
npm run dev
```

Додаток буде доступний на порту 5174.
