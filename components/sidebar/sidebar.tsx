"use client";

import { PanelRightClose, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ar } from "@/lib/content/ar";

import { SidebarPanel, type SidebarActions } from "./sidebar-panel";

const iconButton =
  "flex size-11 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text";

/**
 * - ≥1024px: عمود ثابت على اليمين (بداية السطر في RTL)، قابل للطي.
 * - أقل: Drawer فوق <dialog> الأصلي — حبس التركيز وEsc وإعادة التركيز للزر
 *   يوفّرها المتصفح؛ ونضيف: النقر على الخلفية، وقفل تمرير الصفحة.
 */
export function Sidebar({
  collapsed,
  onCollapse,
  drawerOpen,
  onDrawerClose,
  ...actions
}: SidebarActions & {
  collapsed: boolean;
  onCollapse: () => void;
  drawerOpen: boolean;
  onDrawerClose: () => void;
}) {
  const t = ar.sidebar;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
    if (!drawerOpen) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <>
      {!collapsed && (
        <aside
          aria-label={t.label}
          data-testid="sidebar"
          className="hidden w-72 shrink-0 border-e border-border bg-surface-muted/50 lg:block"
        >
          <SidebarPanel
            {...actions}
            headerAction={
              <button type="button" onClick={onCollapse} aria-label={t.hide} className={iconButton}>
                <PanelRightClose aria-hidden="true" className="size-5" />
              </button>
            }
          />
        </aside>
      )}

      <dialog
        ref={dialogRef}
        id="sidebar-drawer"
        aria-label={t.label}
        data-testid="drawer"
        onClose={onDrawerClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) onDrawerClose(); // نقرة على الخلفية
        }}
        className="sanad-drawer fixed inset-y-0 start-0 m-0 h-dvh max-h-none w-80 max-w-[85vw] border-e border-border bg-bg p-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] text-text shadow-md backdrop:bg-text/40 lg:hidden"
      >
        {/* الغلاف يمنع اعتبار النقر داخل اللوحة نقرًا على الخلفية */}
        <div className="h-full">
          <SidebarPanel
            {...actions}
            onOpen={(id) => {
              actions.onOpen(id);
              onDrawerClose();
            }}
            onNewChat={() => {
              actions.onNewChat();
              onDrawerClose();
            }}
            headerAction={
              <button type="button" onClick={onDrawerClose} aria-label={t.close} className={iconButton}>
                <X aria-hidden="true" className="size-5" />
              </button>
            }
          />
        </div>
      </dialog>
    </>
  );
}
