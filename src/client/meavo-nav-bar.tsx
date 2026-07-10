import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isExternalHref, resolveProfileUrl } from "../gateway-url";
import type { NavLink, NotificationsState, ToolSwitcherState } from "../types";
import { NotificationBell } from "./notification-bell";
import { ToolSwitcher } from "./tool-switcher";
import { UserAvatar } from "./user-avatar";

function defaultIsActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/assemblies/");
  }
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function UserProfileBlock({
  profileHref,
  displayName,
  userName,
  userEmail,
  userImage,
  textAlign = "left",
}: {
  profileHref: string | null;
  displayName: string;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage?: string | null;
  textAlign?: "left" | "right";
}) {
  const avatar = <UserAvatar name={userName} email={userEmail} image={userImage} size="sm" />;
  const textBlock = (
    <div className={`min-w-0 ${textAlign === "right" ? "max-w-[12rem] truncate text-right lg:max-w-none" : ""}`}>
      <p className="truncate text-sm font-medium text-slate-900 group-hover:text-brand-700">{displayName}</p>
      {userEmail && (
        <p
          className={`truncate text-sm text-slate-500 group-hover:text-brand-600 ${
            textAlign === "right" ? "hidden lg:block" : ""
          }`}
        >
          {userEmail}
        </p>
      )}
    </div>
  );

  if (!profileHref) {
    return (
      <div className="flex items-center gap-3">
        {avatar}
        {textBlock}
      </div>
    );
  }

  return (
    <a
      href={profileHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open profile on Gateway"
      className="group flex touch-manipulation items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      {avatar}
      {textBlock}
    </a>
  );
}

function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="submit"
      className={`inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 ${className}`}
    >
      Sign out
    </button>
  );
}

export function MeavoNavBar({
  links,
  logoHref,
  toolSwitcher,
  userName,
  userEmail,
  userImage,
  signOutAction,
  notifications,
  isActiveLink = defaultIsActive,
}: {
  links: NavLink[];
  logoHref: string;
  toolSwitcher: ToolSwitcherState;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage?: string | null;
  signOutAction: () => void | Promise<void>;
  /** When provided, renders the cross-app notification bell. */
  notifications?: NotificationsState;
  isActiveLink?: (pathname: string, href: string) => boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayName = userName ?? userEmail ?? "Account";
  const gatewayUrl = toolSwitcher.options.find((option) => option.id === "gateway")?.url;
  const profileHref = gatewayUrl ? resolveProfileUrl(gatewayUrl) : null;

  const logoClassName =
    "flex shrink-0 items-center rounded-md focus:outline-none focus:ring-2 focus:ring-brand-100";
  const logoImage = (
    <Image
      src="/meavo-logo.png"
      alt="Meavo"
      width={72}
      height={36}
      className="h-8 w-auto object-contain sm:h-9"
      priority
    />
  );

  function renderLinks(className: string): ReactNode {
    return links.map((link) => {
      const active = isActiveLink(pathname, link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`${className} ${
            active
              ? "bg-brand-50 text-brand-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {link.label}
        </Link>
      );
    });
  }

  return (
    <header className="relative z-[100] border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {isExternalHref(logoHref) ? (
            <a href={logoHref} className={logoClassName}>
              {logoImage}
            </a>
          ) : (
            <Link href={logoHref} className={logoClassName}>
              {logoImage}
            </Link>
          )}
          <div className="shrink-0">
            <ToolSwitcher currentId={toolSwitcher.currentId} options={toolSwitcher.options} />
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {renderLinks("rounded-lg px-3 py-2 text-sm font-medium transition")}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {notifications && <NotificationBell notifications={notifications} />}
          <UserProfileBlock
            profileHref={profileHref}
            displayName={displayName}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            textAlign="right"
          />
          <form action={signOutAction}>
            <SignOutButton />
          </form>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {notifications && <NotificationBell notifications={notifications} />}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 top-[57px] z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="mobile-nav"
        className={`absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-lg md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto max-w-6xl space-y-1 px-3 py-3" aria-label="Mobile">
          {renderLinks("block rounded-lg px-3 py-3 text-sm font-medium text-slate-700")}
        </nav>
        <div className="border-t border-slate-100 px-3 py-4">
          <UserProfileBlock
            profileHref={profileHref}
            displayName={displayName}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
          />
          <form action={signOutAction} className="mt-3">
            <SignOutButton className="w-full" />
          </form>
        </div>
      </div>
    </header>
  );
}
