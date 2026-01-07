import { TFunction } from "i18next";

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

export const getProjectsData = (t: TFunction): Record<string, Project> => ({
  kernel: {
    id: "kernel",
    title: "KERNEL",
    subtitle: "Agro / GIS Analytics",
    content: `
      <div>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
          "portfolio.experience.projects.kernel.intro"
        )}</h5>
        <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>${t("portfolio.experience.projects.kernel.apps.1")}</li>
          <li>${t("portfolio.experience.projects.kernel.apps.2")}</li>
        </ul>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
          "portfolio.experience.projects.kernel.combined"
        )}</h5>
        <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li><strong class="text-foreground font-semibold">${t(
            "portfolio.experience.projects.kernel.technologies.mapbox"
          )}</strong></li>
          <li><strong class="text-foreground font-semibold">${t(
            "portfolio.experience.projects.kernel.technologies.arcgis"
          )}</strong></li>
        </ul>
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
          "portfolio.experience.projects.kernel.tech_stack"
        )}</h5>
        <a href="https://www.kernel.ua/ua/" target="_blank" class="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80 mb-6 inline-block">${t(
          "portfolio.experience.projects.kernel.link"
        )}</a>
        <div class="block border-l-2 border-accent bg-accent/5 p-4 my-6 text-xs text-accent font-mono">${t(
          "portfolio.experience.projects.kernel.nda"
        )}</div>
      </div>
    `,
  },
  u_studio: {
    id: "u_studio",
    title: "U-STUDIO",
    subtitle: "Gov Tech / DREAM Ecosystem",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.u_studio.intro"
      )}</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
        "portfolio.experience.projects.u_studio.technologies"
      )}</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <li><strong class="text-foreground font-semibold">${t(
          "portfolio.experience.projects.u_studio.tech_list.1"
        )}</strong></li>
        <li><strong class="text-foreground font-semibold">${t(
          "portfolio.experience.projects.u_studio.tech_list.2"
        )}</strong></li>
        <li><strong class="text-foreground font-semibold">${t(
          "portfolio.experience.projects.u_studio.tech_list.3"
        )}</strong></li>
        <li><strong class="text-foreground font-semibold">${t(
          "portfolio.experience.projects.u_studio.tech_list.4"
        )}</strong></li>
      </ul>
      <a href="https://map.dream.gov.ua/" target="_blank" class="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80">${t(
        "portfolio.experience.projects.u_studio.link"
      )}</a>
    `,
  },
  ixlayer: {
    id: "ixlayer",
    title: "IXLAYER",
    subtitle: "Health Tech / DNA",
    content: `
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
          "portfolio.experience.projects.ixlayer.intro"
        )}</h5>
        <li>${t("portfolio.experience.projects.ixlayer.work.1")}</li>
        <li>${t("portfolio.experience.projects.ixlayer.work.2")}</li>
      </ul>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
        "portfolio.experience.projects.ixlayer.tech_stack"
      )}</h5>
      <a href="https://ixlayer.com/" target="_blank" class="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80">${t(
        "portfolio.experience.projects.ixlayer.link"
      )}</a>
    `,
  },
  cubic_worlds: {
    id: "cubic_worlds",
    title: "CUBIC WORLDS",
    subtitle: "Indie Game Development",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.cubic_worlds.intro"
      )}</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
        "portfolio.experience.projects.cubic_worlds.features"
      )}</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
        <li>${t(
          "portfolio.experience.projects.cubic_worlds.features_list.1"
        )}</li>
        <li>${t(
          "portfolio.experience.projects.cubic_worlds.features_list.2"
        )}</li>
        <li>${t(
          "portfolio.experience.projects.cubic_worlds.features_list.3"
        )}</li>
      </ul>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
        "portfolio.experience.projects.cubic_worlds.tech_stack"
      )}</h5>
    `,
  },
  map_dream: {
    id: "map_dream",
    title: "MAP DREAM",
    subtitle: "U-STUDIO / ECOSYSTEM",
    category: "CASE STUDY 01",
    color: "indigo",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.map_dream.intro"
      )}</p>
      <h5 class="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4 font-medium">${t(
        "portfolio.experience.projects.map_dream.features"
      )}</h5>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>${t(
            "portfolio.experience.projects.map_dream.features_list.1"
          )}</li>
          <li>${t(
            "portfolio.experience.projects.map_dream.features_list.2"
          )}</li>
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
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.dashboard_fields.intro"
      )}</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>${t(
            "portfolio.experience.projects.dashboard_fields.features_list.1"
          )}</li>
          <li>${t(
            "portfolio.experience.projects.dashboard_fields.features_list.2"
          )}</li>
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
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.passport_field.intro"
      )}</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>${t(
            "portfolio.experience.projects.passport_field.features_list.1"
          )}</li>
          <li>${t(
            "portfolio.experience.projects.passport_field.features_list.2"
          )}</li>
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
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.ixlayer_landing.intro"
      )}</p>
      <ul class="list-disc pl-6 mb-6 text-foreground/80 text-sm leading-[1.7]">
          <li>${t(
            "portfolio.experience.projects.ixlayer_landing.features_list.1"
          )}</li>
          <li>${t(
            "portfolio.experience.projects.ixlayer_landing.features_list.2"
          )}</li>
      </ul>
    `,
  },
  computools: {
    id: "computools",
    title: "COMPUTOOLS",
    subtitle: "Frontend Engineering / First Steps",
    content: `
      <p class="mb-6 leading-[1.7] text-foreground/80 text-sm">${t(
        "portfolio.experience.projects.computools.intro"
      )}</p>
      <a href="https://careers.computools.ua/" target="_blank" class="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80">${t(
        "portfolio.experience.projects.computools.link"
      )}</a>
    `,
  },
});

// Legacy export for backward compatibility - use getProjectsData(t) instead
export const PROJECTS_DATA: Record<string, Project> = getProjectsData(
  ((key: string) => key) as unknown as TFunction
);

export const getExperienceList = (t: TFunction): ExperienceItem[] => [
  {
    id: "u_studio",
    number: "02",
    category: t("portfolio.experience.experience_list.u_studio.category"),
    title: "U-STUDIO",
    description: t("portfolio.experience.experience_list.u_studio.description"),
    tags: ["React", "Mapbox GL"],
    colorClass: "group-hover:text-blue-400",
  },
  {
    id: "kernel",
    number: "01",
    category: t("portfolio.experience.experience_list.kernel.category"),
    title: "KERNEL",
    description: t("portfolio.experience.experience_list.kernel.description"),
    tags: ["Angular", "ArcGIS"],
    colorClass: "group-hover:text-emerald-400",
  },
  {
    id: "cubic_worlds",
    number: "05",
    category: t("portfolio.experience.experience_list.cubic_worlds.category"),
    title: "CUBIC WORLDS",
    description: t(
      "portfolio.experience.experience_list.cubic_worlds.description"
    ),
    tags: ["Three.js", "WebGL"],
    colorClass: "group-hover:text-pink-400",
  },
  {
    id: "ixlayer",
    number: "03",
    category: t("portfolio.experience.experience_list.ixlayer.category"),
    title: "IXLAYER",
    description: t("portfolio.experience.experience_list.ixlayer.description"),
    tags: ["Vue.js", "SaaS"],
    colorClass: "group-hover:text-purple-400",
  },
  {
    id: "computools",
    number: "04",
    category: t("portfolio.experience.experience_list.computools.category"),
    title: "COMPUTOOLS",
    description: t(
      "portfolio.experience.experience_list.computools.description"
    ),
    tags: ["HTML", "CSS", "JavaScript"],
    colorClass: "group-hover:text-green-400",
  },
];

// Legacy export for backward compatibility - use getExperienceList(t) instead
export const EXPERIENCE_LIST: ExperienceItem[] = getExperienceList(
  ((key: string) => key) as unknown as TFunction
);
