export type Language = 'en' | 'fr' | 'de' | 'es' | 'it' | 'ru';
export type Theme = 'light' | 'dark';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  deletedAt?: number | null;
}

export interface Task {
  id: string;
  name: string;
  prompts: Prompt[];
  deletedAt?: number | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  deletedAt?: number | null; // If present, it's in trash
  tasks: Task[];
}

export interface NodeData {
  label: string;
  content: string;
}

export interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  currentTaskId: string | null;
  settings: {
    language: Language;
    theme: Theme;
  };
  ui: {
    isTrashOpen: boolean;
    isBeProudOpen: boolean;
    viewMode: 'list' | 'flow';
  };
}

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  ru: 'Русский',
};

export const TIPS: Record<Language, string[]> = {
  en: [
    "Organize tasks by workflow.", "Use descriptive prompt titles.", "Connect related prompts in Flow.",
    "Review trash before permanent delete.", "Use dark mode for night work.", "Keep prompt descriptions concise.",
    "Drag projects to reorder.", "Double click to edit names."
  ],
  it: [
    "Organizza i task per flusso.", "Usa titoli descrittivi.", "Collega i prompt nel Flow.",
    "Controlla il cestino prima di eliminare.", "Usa la dark mode di notte.", "Descrizioni brevi e concise.",
    "Trascina i progetti per riordinare.", "Doppio click per modificare i nomi."
  ],
  fr: [
    "Organisez par flux de travail.", "Titres descriptifs.", "Connectez les prompts.",
    "Vérifiez la corbeille.", "Mode sombre la nuit.", "Descriptions concises.",
    "Glissez pour réorganiser.", "Double-clic pour éditer."
  ],
  de: [
    "Nach Workflow organisieren.", "Aussagekräftige Titel.", "Prompts verbinden.",
    "Papierkorb prüfen.", "Dunkelmodus nutzen.", "Kurze Beschreibungen.",
    "Ziehen zum Neuanordnen.", "Doppelklick zum Bearbeiten."
  ],
  es: [
    "Organiza por flujo.", "Títulos descriptivos.", "Conecta los prompts.",
    "Revisa la papelera.", "Modo oscuro noche.", "Descripciones concisas.",
    "Arrastra para reordenar.", "Doble clic para editar."
  ],
  ru: [
    "Организуйте по рабочему процессу.", "Используйте понятные заголовки.", "Соединяйте промпты.",
    "Проверяйте корзину.", "Темный режим ночью.", "Краткие описания.",
    "Перетаскивайте проекты.", "Двойной клик для редактирования."
  ]
};