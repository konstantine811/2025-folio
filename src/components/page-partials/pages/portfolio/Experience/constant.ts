export interface Project {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category?: string;
  tags?: string[];
  color?: string;
}

export interface ExperienceItem {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  colorClass: string;
}

export const PROJECTS_DATA: Record<string, Project> = {
  kernel: {
    id: "kernel",
    title: "KERNEL",
    subtitle: "Agro / GIS Analytics",
    content: `
      <div>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">У компанії <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">Kernel</em> я пропрацював 5 років, де з нуля розробив два повноцінних веб-додатки:</h5>
        <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>загальна інтерактивна мапа всіх полів за кластерами (понад 8 000 полігонів);</li>
          <li>система детальної аналітики по конкретному полю.</li>
        </ul>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">У проєктах ми поєднували:</h5>
        <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li><strong class="text-foreground font-semibold">Mapbox</strong> — для відображення геометрії та інтерактивної графіки;</li>
          <li><strong class="text-foreground font-semibold">ArcGIS</strong> — для роботи з растровими даними: <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">NDVI-знімки</em>, <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">ґрунтові тайли</em>, <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">треки нарядів</em>.</li>
        </ul>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Технології: <strong class="text-foreground font-semibold">Angular 2+</strong>, <strong class="text-foreground font-semibold">D3.js</strong>, <strong class="text-foreground font-semibold">Turf.js</strong>, <strong class="text-foreground font-semibold">ArcGIS</strong>, <strong class="text-foreground font-semibold">Mapbox</strong>, <strong class="text-foreground font-semibold">AgGrid</strong>, <strong class="text-foreground font-semibold">Material UI</strong>.</h5>
        <div class="block border-l-2 border-accent bg-accent/5 p-4 my-6 text-xs text-accent font-mono">На жаль, я не можу надати жодної візуальної інформації чи лінків, оскільки проєкт був закритим внутрішнім рішенням (NDA).</div>
      </div>
    `,
  },
  u_studio: {
    id: "u_studio",
    title: "U-STUDIO",
    subtitle: "Gov Tech / DREAM Ecosystem",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">В <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">Ustudio</em> працюю останні два роки. З нуля самостійно розробив фронтенд-частину застосунку для відображення зруйнованих та відбудованих об'єктів під час війни в Україні. Реалізовано теплову мапу рівня профінансованості та потреб, фільтри за типами об'єктів, аналітичні діаграми й детальні картки кожного об'єкта.</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Технології:</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <li><strong class="text-foreground font-semibold">React / Redux</strong></li>
        <li><strong class="text-foreground font-semibold">Mapbox GL</strong></li>
        <li><strong class="text-foreground font-semibold">Tailwind CSS / Framer Motion</strong></li>
        <li><strong class="text-foreground font-semibold">D3.js / IndexedDB</strong></li>
      </ul>
      <a href="https://dream.gov.ua" target="_blank" class="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80">Перейти до DREAM</a>
    `,
  },
  ixlayer: {
    id: "ixlayer",
    title: "IXLAYER",
    subtitle: "Health Tech / DNA",
    content: `
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">В <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">ixlayer</em> працював віддалено понад два роки.</h5>
        <li>Розробляв веб-сайти на <strong class="text-foreground font-semibold">Vue.js</strong> для сервісів генетичного ДНК-тестування.</li>
        <li>Основний фокус — <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">landing pages</em>, <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">форми реєстрації</em> та <em class="text-foreground not-italic bg-foreground/10 px-1 rounded">анкети/бланки</em>.</li>
      </ul>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Технології: <strong class="text-foreground font-semibold">Vue.js</strong>, <strong class="text-foreground font-semibold">Storybook</strong>, <strong class="text-foreground font-semibold">Cypress</strong>.</h5>
    `,
  },
  cubic_worlds: {
    id: "cubic_worlds",
    title: "CUBIC WORLDS",
    subtitle: "Indie Game Development",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm"><strong class="text-foreground font-semibold">Cubic Worlds Game</strong> — моя перша офіційна гра, яку планую розвивати найближчими місяцями. Це цілий світ, де можна захищати селища, збирати зілля та відкривати магічні здібності.</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Можливості:</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <li>Малювання 3D об'єктами по поверхні</li>
        <li>Режим редагування світу та фізика</li>
        <li>Voxel-генерація світу</li>
      </ul>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Технології: <strong class="text-foreground font-semibold">React-Three-Fiber</strong>, <strong class="text-foreground font-semibold">Three.js</strong>, <strong class="text-foreground font-semibold">Cannon.js</strong>.</h5>
    `,
  },
  map_dream: {
    id: "map_dream",
    title: "MAP DREAM",
    subtitle: "U-STUDIO / ECOSYSTEM",
    category: "CASE STUDY 01",
    color: "indigo",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">Екосистема DREAM — це цифрова платформа для відновлення України. Моя роль полягала у створенні головного модуля відображення геоданих.</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">Ключові функції:</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li><strong class="text-foreground font-semibold">Кластеризація:</strong> Обробка 10,000+ об'єктів.</li>
          <li><strong class="text-foreground font-semibold">Теплова мапа:</strong> Шар аналітики руйнувань.</li>
      </ul>
    `,
  },
  dashboard_fields: {
    id: "dashboard_fields",
    title: "DASHBOARD FIELDS",
    subtitle: "KERNEL / AGRO ANALYTICS",
    category: "CASE STUDY 02",
    color: "emerald",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">Центральна панель керування для головного агронома холдингу.</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>Real-time моніторинг техніки через GPS.</li>
          <li>Прогноз врожайності на основі NDVI.</li>
      </ul>
    `,
  },
  passport_field: {
    id: "passport_field",
    title: "PASSPORT FIELD",
    subtitle: "KERNEL / FIELD DATA",
    category: "CASE STUDY 03",
    color: "amber",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">Цифровий двійник кожного поля компанії з історією за 10 років.</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>Агрохімічні карти ґрунтів.</li>
          <li>Візуалізація нашарування растрових тайлів (ArcGIS).</li>
      </ul>
    `,
  },
  ixlayer_landing: {
    id: "ixlayer_landing",
    title: "IXLAYER LANDING",
    subtitle: "IXLAYER / MARKETING",
    category: "CASE STUDY 04",
    color: "pink",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">Серія високонавантажених маркетингових сторінок для телемедицини в США.</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>Оптимізована конверсія та A/B тести.</li>
          <li>Accessibility WCAG 2.1 compliance.</li>
      </ul>
    `,
  },
};

export const EXPERIENCE_LIST: ExperienceItem[] = [
  {
    id: "kernel",
    number: "01",
    category: "AGRO TECH",
    title: "KERNEL",
    description:
      "GIS ecosystem for field analytics. 8000+ polygons, soil analysis, and machinery tracking.",
    tags: ["Angular", "ArcGIS"],
    colorClass: "group-hover:text-emerald-400",
  },
  {
    id: "u_studio",
    number: "02",
    category: "GOVERNMENT",
    title: "U-STUDIO",
    description:
      "National restoration ecosystem (DREAM). Visualizing infrastructure and financial flows.",
    tags: ["React", "Mapbox GL"],
    colorClass: "group-hover:text-blue-400",
  },
  {
    id: "ixlayer",
    number: "03",
    category: "HEALTH TECH",
    title: "IXLAYER",
    description:
      "DNA testing services platform. Complex forms and registration flows.",
    tags: ["Vue.js", "SaaS"],
    colorClass: "group-hover:text-purple-400",
  },
  {
    id: "cubic_worlds",
    number: "04",
    category: "INDIE GAME",
    title: "CUBIC WORLDS",
    description:
      "Personal 3D RPG game engine. Voxel world generation and physics.",
    tags: ["Three.js", "WebGL"],
    colorClass: "group-hover:text-pink-400",
  },
];
