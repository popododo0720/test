"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

const logo = "/sites/www-andidea-jp-f5b0a421/root-8a5edab2/logo.png";
const navigation = [
  { label: "Works", href: "https://www.andidea.jp/works" },
  { label: "About", href: "https://www.andidea.jp/about" },
  { label: "Training", href: "https://www.andidea.jp/training" },
  { label: "Shop", href: "https://www.andidea.jp/shop" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const toggle = toggleRef.current;
    if (!dialog || !isOpen) return;

    // Native modal dialogs trap focus and make the background inert.
    dialog.showModal();
    document.body.classList.add(styles.scrollLocked);
    const desktop = window.matchMedia("(min-width: 701px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);

    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog.close();
      document.body.classList.remove(styles.scrollLocked);
      toggle?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <a className="skip-link" href="#main">メインコンテンツへスキップ</a>
      <header className="site-header story-header">
        <Link className="wordmark" href="/" aria-label="And Idea ホーム">
          <Image src={logo} alt="And Idea" width={107} height={107} priority unoptimized />
        </Link>
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          {navigation.map(({ label, href }) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="contact-link" href="mailto:info@andidea.jp">
            Let’s talk <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <button ref={toggleRef} className="mobile-toggle" type="button" aria-label="メニューを開く" aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen(true)}>
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </header>
      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        className={`mobile-sheet ${styles.sheet}`}
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        aria-describedby="mobile-navigation-description"
        onCancel={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setIsOpen(false);
        }}
      >
        <h2 id="mobile-navigation-title">
          <Image src={logo} alt="And Idea" width={107} height={107} unoptimized />
        </h2>
        <p id="mobile-navigation-description" data-slot="sheet-description">Creative Intelligence Studio</p>
        <nav aria-label="モバイルナビゲーション">
          {[{ label: "Home", href: "/" }, ...navigation].map(({ label, href }, index) => (
            <a key={label} href={href} onClick={() => setIsOpen(false)}>
              <small>{String(index + 1).padStart(2, "0")}</small>{label}<ArrowUpRight size={24} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <a className="text-link" href="mailto:info@andidea.jp">info@andidea.jp <ArrowUpRight size={18} aria-hidden="true" /></a>
        <button className={styles.close} type="button" aria-label="メニューを閉じる" onClick={() => setIsOpen(false)}>
          <X size={16} aria-hidden="true" />
        </button>
      </dialog>
    </>
  );
}
