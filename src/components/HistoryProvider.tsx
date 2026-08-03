"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import HistoryPanel from "@/components/HistoryPanel";
import PasscodeGate, { PASSCODE_STORAGE_KEY } from "@/components/PasscodeGate";

type HistoryContextValue = {
  requestOpen: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}

export default function HistoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";
  const [panelOpen, setPanelOpen] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const originPath = useRef(pathname);

  function requestOpen() {
    originPath.current = pathname;
    if (sessionStorage.getItem(PASSCODE_STORAGE_KEY) === "1") {
      setPanelOpen(true);
    } else {
      setShowPasscodeModal(true);
    }
  }

  function closePanel() {
    setPanelOpen(false);
    if (pathname !== originPath.current) {
      router.push(originPath.current);
    }
  }

  // On mobile the panel takes up nearly the whole screen, so picking an item
  // should just hide it (no return-to-origin nav) to reveal the result.
  function hidePanelOnMobile() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setPanelOpen(false);
    }
  }

  return (
    <HistoryContext.Provider value={{ requestOpen }}>
      {isLanding ? (
        <div className="relative flex-1 overflow-hidden">
          <div
            className={`transition-[filter] duration-300 ease-out ${
              panelOpen ? "pointer-events-none blur-sm" : ""
            }`}
          >
            {children}
          </div>
          {panelOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={closePanel}
              aria-hidden
            />
          )}
          <HistoryPanel
            variant="overlay"
            open={panelOpen}
            onClose={closePanel}
            onItemSelect={hidePanelOnMobile}
          />
        </div>
      ) : (
        <div className="flex min-h-full flex-1">
          <div className="min-w-0 flex-1">{children}</div>
          <HistoryPanel
            variant="dock"
            open={panelOpen}
            onClose={closePanel}
            onItemSelect={hidePanelOnMobile}
          />
        </div>
      )}

      {showPasscodeModal && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowPasscodeModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[22px] bg-white shadow-[0_20px_60px_-15px_rgba(30,40,90,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <PasscodeGate
              onUnlock={() => {
                setShowPasscodeModal(false);
                setPanelOpen(true);
              }}
              onClose={() => setShowPasscodeModal(false)}
            />
          </div>
        </div>
      )}
    </HistoryContext.Provider>
  );
}
