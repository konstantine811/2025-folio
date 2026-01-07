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
        <h5>У компанії <em>Kernel</em> я пропрацював 5 років, де з нуля розробив два повноцінних веб-додатки:</h5>
        <ul>
          <li>загальна інтерактивна мапа всіх полів за кластерами (понад 8 000 полігонів);</li>
          <li>система детальної аналітики по конкретному полю.</li>
        </ul>
        <h5>У проєктах ми поєднували:</h5>
        <ul>
          <li><strong>Mapbox</strong> — для відображення геометрії та інтерактивної графіки;</li>
          <li><strong>ArcGIS</strong> — для роботи з растровими даними: <em>NDVI-знімки</em>, <em>ґрунтові тайли</em>, <em>треки нарядів</em>.</li>
        </ul>
        <h5>Технології: <strong>Angular 2+</strong>, <strong>D3.js</strong>, <strong>Turf.js</strong>, <strong>ArcGIS</strong>, <strong>Mapbox</strong>, <strong>AgGrid</strong>, <strong>Material UI</strong>.</h5>
        <div class="side_line">На жаль, я не можу надати жодної візуальної інформації чи лінків, оскільки проєкт був закритим внутрішнім рішенням (NDA).</div>
      </div>
    `,
  },
  u_studio: {
    id: "u_studio",
    title: "U-STUDIO",
    subtitle: "Gov Tech / DREAM Ecosystem",
    content: `
      <p>В <em>Ustudio</em> працюю останні два роки. З нуля самостійно розробив фронтенд-частину застосунку для відображення зруйнованих та відбудованих об’єктів під час війни в Україні. Реалізовано теплову мапу рівня профінансованості та потреб, фільтри за типами об’єктів, аналітичні діаграми й детальні картки кожного об’єкта.</p>
      <h5>Технології:</h5>
      <ul>
        <li><strong>React / Redux</strong></li>
        <li><strong>Mapbox GL</strong></li>
        <li><strong>Tailwind CSS / Framer Motion</strong></li>
        <li><strong>D3.js / IndexedDB</strong></li>
      </ul>
      <a href="https://dream.gov.ua" target="_blank">Перейти до DREAM</a>
    `,
  },
  ixlayer: {
    id: "ixlayer",
    title: "IXLAYER",
    subtitle: "Health Tech / DNA",
    content: `
      <ul>
        <h5>В <em>ixlayer</em> працював віддалено понад два роки.</h5>
        <li>Розробляв веб-сайти на <strong>Vue.js</strong> для сервісів генетичного ДНК-тестування.</li>
        <li>Основний фокус — <em>landing pages</em>, <em>форми реєстрації</em> та <em>анкети/бланки</em>.</li>
      </ul>
      <h5>Технології: <strong>Vue.js</strong>, <strong>Storybook</strong>, <strong>Cypress</strong>.</h5>
    `,
  },
  cubic_worlds: {
    id: "cubic_worlds",
    title: "CUBIC WORLDS",
    subtitle: "Indie Game Development",
    content: `
      <p><strong>Cubic Worlds Game</strong> — моя перша офіційна гра, яку планую розвивати найближчими місяцями. Це цілий світ, де можна захищати селища, збирати зілля та відкривати магічні здібності.</p>
      <h5>Можливості:</h5>
      <ul>
        <li>Малювання 3D об'єктами по поверхні</li>
        <li>Режим редагування світу та фізика</li>
        <li>Voxel-генерація світу</li>
      </ul>
      <h5>Технології: <strong>React-Three-Fiber</strong>, <strong>Three.js</strong>, <strong>Cannon.js</strong>.</h5>
    `,
  },
  map_dream: {
    id: "map_dream",
    title: "MAP DREAM",
    subtitle: "U-STUDIO / ECOSYSTEM",
    category: "CASE STUDY 01",
    color: "indigo",
    content: `
      <p>Екосистема DREAM — це цифрова платформа для відновлення України. Моя роль полягала у створенні головного модуля відображення геоданих.</p>
      <h5>Ключові функції:</h5>
      <ul>
          <li><strong>Кластеризація:</strong> Обробка 10,000+ об'єктів.</li>
          <li><strong>Теплова мапа:</strong> Шар аналітики руйнувань.</li>
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
      <p>Центральна панель керування для головного агронома холдингу.</p>
      <ul>
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
      <p>Цифровий двійник кожного поля компанії з історією за 10 років.</p>
      <ul>
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
      <p>Серія високонавантажених маркетингових сторінок для телемедицини в США.</p>
      <ul>
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
