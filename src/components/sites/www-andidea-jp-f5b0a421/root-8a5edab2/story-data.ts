export interface StoryScene {
  name: string;
  start: number;
  end: number;
  style: string;
  label: string;
  lines: readonly string[];
  accent: number;
}
export const scenes: readonly StoryScene[] = [
  { name: "はじまり", start: 0, end: .11, style: "intro", label: "HUMAN IMAGINATION × AI", lines: ["Imagination", "begins here."], accent: 0 },
  { name: "私たちの考え方", start: .16, end: .29, style: "manifesto", label: "HUMAN CREATIVITY. AI POSSIBILITY.", lines: ["人の想像力に、", "AIという", "可能性を。"], accent: 2 },
  { name: "映像と表現", start: .35, end: .47, style: "create", label: "FILM / ANIMATION / VISUAL EXPRESSION", lines: ["Make the", "unseen,", "real."], accent: 1 },
  { name: "技術とアイデア", start: .53, end: .64, style: "discover", label: "IDEAS WITHOUT LIMITS", lines: ["Beyond the", "ordinary."], accent: 1 },
  { name: "制作・開発・研修", start: .7, end: .83, style: "services", label: "FROM THE FIRST IDEA. TO WHAT COMES NEXT.", lines: ["Create. Develop.", "Empower."], accent: 1 },
  { name: "お問い合わせ", start: .89, end: 1, style: "outro", label: "AND IDEA / CREATIVE INTELLIGENCE STUDIO", lines: ["A new world", "starts with", "your idea."], accent: 2 },
];
export const assetRoot = "/sites/www-andidea-jp-f5b0a421/root-8a5edab2";
export const sourceLink = (path: string) => `https://www.andidea.jp${path}`;
