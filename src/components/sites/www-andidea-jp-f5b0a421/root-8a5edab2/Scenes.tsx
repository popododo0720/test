import { ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { scenes, sourceLink } from "./story-data";

function WordLine({ text }: { text: string }) {
  return <span className="journey-line">{text.split(" ").map((word, index) => (
    <span className="journey-word-mask" key={index}><span className="journey-word">{word}{" "}</span></span>
  ))}</span>;
}
function Heading({ index, children }: { index: number; children?: ReactNode }) {
  const scene = scenes[index];
  const Tag = index === 0 ? "h1" : "h2";
  return <div className="journey-heading">
    <span className="journey-label">{scene.label}</span>
    <Tag>{scene.lines.map((line, i) => i === scene.accent
      ? <em key={line}><WordLine text={line} /></em>
      : <WordLine key={line} text={line} />)}</Tag>
    {children}
  </div>;
}
function Pill({ href, children }: { href: string; children: ReactNode }) {
  return <a className="journey-pill" href={href}>{children}<ArrowUpRight size={16} /></a>;
}
export function IntroScene({ jump }: { jump: (index: number) => void }) {
  return <>
    <Heading index={0} />
    <aside className="journey-news" aria-labelledby="journey-news-title">
      <div className="journey-news-heading"><span>NEWS</span><h2 id="journey-news-title">お知らせ</h2></div>
      <ul><li><time dateTime="2026-09-08">2026/09/08</time><p>サイト改修</p></li></ul>
    </aside>
    <div className="journey-intro-aside">
      <p>まだない世界は、<br /><em>ひとつの想像</em>から。</p>
      <button className="journey-scroll-cue" onClick={() => jump(1)}>SCROLL TO BEGIN <ArrowDown size={16} /></button>
    </div>
  </>;
}
export function ManifestoScene() {
  return <>
    <Heading index={1}><Pill href={sourceLink("/about")}>ABOUT AND IDEA</Pill></Heading>
    <div className="journey-corner-copy"><span className="journey-label">BEYOND THE EXPECTED</span>
      <p>技術の先に、心が動く表現を。<br />アイデアとテクノロジーのあいだを<br />つなぎ、まだないものを形にします。</p>
    </div>
  </>;
}
export function CreateScene() {
  return <>
    <Heading index={2} />
    <div className="journey-corner-copy"><span className="journey-label">想像を、映像へ。</span>
      <p>実写、アニメーション、マンガ。<br />表現の境界を越えて、<br />見る人の心に残る世界をつくる。</p>
      <Pill href={sourceLink("/works")}>EXPLORE OUR WORK</Pill>
    </div>
  </>;
}
export function DiscoverScene() {
  return <>
    <Heading index={3}><p className="journey-tagline">アイデアを、次の可能性へ。</p><Pill href={sourceLink("/shop")}>DISCOVER OUR TOOLS</Pill></Heading>
    <div className="journey-corner-copy"><span className="journey-label">CREATIVE TECHNOLOGY</span>
      <p>生成AIの検証から、制作ツールの開発まで。<br />つくる人の可能性が広がる仕組みを。</p>
    </div>
  </>;
}
export function ServicesScene() {
  return <>
    <Heading index={4}><p className="journey-tagline">つくる。実装する。伝える。</p></Heading>
    <nav className="journey-service-links" aria-label="事業紹介">
      {[["01 / CREATE", "映像・アニメーション", "/works"], ["02 / DEVELOP", "技術開発・制作ツール", "/shop"], ["03 / EMPOWER", "生成AI・LLM活用研修", "/training"]].map(([label, title, path]) => (
        <a href={sourceLink(path)} key={path}><span>{label}</span><strong>{title}</strong><ArrowUpRight size={20} /></a>
      ))}
    </nav>
  </>;
}
export function OutroScene({ jump }: { jump: (index: number) => void }) {
  return <>
    <Heading index={5}><p className="journey-tagline">まだ形になっていない、そのアイデアから。</p><Pill href="mailto:info@andidea.jp">LET’S TALK</Pill></Heading>
    <div className="journey-footer">
      <nav aria-label="ページ末尾のナビゲーション">
        {[["COMPANY", "/about"], ["COLLABORATIONS", "/works#credits"], ["TRAINING", "/training"], ["SHOP", "/shop"]].map(([label, path]) => <a key={path} href={sourceLink(path)}>{label}</a>)}
      </nav>
      <div><a href="mailto:info@andidea.jp">info@andidea.jp</a><span>© 2026 And Idea Co., Ltd.</span><button onClick={() => jump(0)}>BACK TO TOP <ArrowUp size={14} /></button></div>
    </div>
  </>;
}
