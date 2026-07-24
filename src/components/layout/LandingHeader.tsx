"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../../../logo and brand guildeline/propmanage_bw_logo.png";

type LandingHeaderProps = {
  brand: string;
  featuresLabel: string;
  pricingLabel: string;
  loginPath: string;
  ctaPath: string;
  ctaLabel: string;
};

export default function LandingHeader({
  brand,
  featuresLabel,
  pricingLabel,
  loginPath,
  ctaPath,
  ctaLabel,
}: LandingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-ghost bg-bg-card">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="PropManage BW logo" width={28} height={28} className="h-7 w-7 object-contain" />
          <p className="text-lg font-semibold text-primary">{brand}</p>
        </div>
        <nav className="hidden items-center gap-8 text-xs text-text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-primary">
            {featuresLabel}
          </a>
          <a href="#pricing" className="transition-colors hover:text-primary">
            {pricingLabel}
          </a>
          <Link href={loginPath} className="transition-colors hover:text-primary">
            Login
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={ctaPath}
            className="hidden rounded-md bg-primary px-4 py-2 text-xs font-medium text-white sm:inline-flex"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="text-text-muted md:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className="border-t border-border-ghost bg-bg-card px-4 py-4 md:hidden">
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={closeMenu} aria-label="Close menu">
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>
          <nav className="space-y-3 text-sm text-text-sub">
            <a href="#features" className="block hover:text-primary" onClick={closeMenu}>
              {featuresLabel}
            </a>
            <a href="#pricing" className="block hover:text-primary" onClick={closeMenu}>
              {pricingLabel}
            </a>
            <Link href={loginPath} className="block hover:text-primary" onClick={closeMenu}>
              Login
            </Link>
            <Link
              href={ctaPath}
              className="mt-2 inline-flex rounded-md bg-primary px-4 py-2 text-xs font-medium text-white"
              onClick={closeMenu}
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
