import { useState, useMemo, ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import SoundHoverElement from "./sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";

interface PaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  gridClassName?: string;
}

export function Pagination<T>({
  items,
  itemsPerPage = 8,
  renderItem,
  className,
  gridClassName,
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when items change (e.g., when filter changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);
  const currentItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  // Calculate display range for INDEX (1-based)
  // startIndex is 0-based, so add 1 for display
  // endIndex is exclusive in slice, so it equals the 1-based index of the last displayed item
  const displayStart = startIndex + 1;
  const displayEnd = endIndex;

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={cn(
        "relative flex flex-col min-h-[calc(100vh-200px)]",
        className
      )}
    >
      {/* Main content with grid */}
      <ul
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
          gridClassName
        )}
      >
        {currentItems.map((item, index) => (
          <li key={index}>{renderItem(item, index)}</li>
        ))}
      </ul>

      {/* Footer with INDEX and Pagination */}
      <div className="sticky z-50 bottom-0 left-0 right-0 flex items-center justify-between p-8 bg-background/80 backdrop-blur-sm border-t border-foreground/10 mt-20 font-mono text-xs">
        {/* INDEX: X-Y/Z or X/Z - Bottom Left */}
        <div className="text-muted-foreground">
          INDEX:{" "}
          {displayStart === displayEnd
            ? displayStart
            : `${displayStart}-${displayEnd}`}
          /{items.length}
        </div>

        {/* Pagination Controls - Bottom Right */}
        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            {/* PREV */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={cn(
                "transition-colors cursor-pointer select-none",
                currentPage === 1
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              )}
            >
              PREV
            </button>

            {/* Page Numbers */}
            <div className="flex items-center">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="text-muted-foreground/50"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <SoundHoverElement
                    hoverTypeElement={SoundTypeElement.BUTTON}
                    hoverStyleElement={HoverStyleElement.circle}
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    className={cn(
                      "transition-all duration-300 cursor-pointer px-3 py-1 select-none",
                      isActive
                        ? "text-foreground scale-101 text-base"
                        : "text-muted-foreground hover:text-foreground text-sm"
                    )}
                  >
                    {pageNum}
                  </SoundHoverElement>
                );
              })}
            </div>

            {/* NEXT */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "transition-colors",
                currentPage === totalPages
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground cursor-pointer select-none"
              )}
            >
              NEXT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
