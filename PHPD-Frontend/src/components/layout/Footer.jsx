import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © {currentYear} All copyrights reserved for{" "}
              <span className="font-semibold text-foreground">NESPAK</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">PHPD Dashboard</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Health & Population Department</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
