"use client";

import {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ScrollFadeAxis = "horizontal" | "vertical" | "both";

type ScrollFadeProps = {
  axis?: ScrollFadeAxis;
  children: ReactNode;
  className?: string;
  fadeClassName?: string;
  fadeIntensity?: number;
  scrollClassName?: string;
};

export type ScrollFadeHandle = {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

type EdgeState = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

const initialEdges: EdgeState = {
  top: false,
  right: false,
  bottom: false,
  left: false,
};

const canScrollX = (axis: ScrollFadeAxis) =>
  axis === "horizontal" || axis === "both";

const canScrollY = (axis: ScrollFadeAxis) =>
  axis === "vertical" || axis === "both";

export const ScrollFade = forwardRef<ScrollFadeHandle, ScrollFadeProps>(
  function ScrollFade(
    {
      axis = "vertical",
      children,
      className,
      fadeClassName,
      fadeIntensity = 1,
      scrollClassName,
    },
    forwardedRef,
  ) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<EdgeState>(initialEdges);

  const updateEdges = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const nextEdges = {
      top: canScrollY(axis) && element.scrollTop > 1,
      left: canScrollX(axis) && element.scrollLeft > 1,
      bottom:
        canScrollY(axis) &&
        element.scrollTop + element.clientHeight < element.scrollHeight - 1,
      right:
        canScrollX(axis) &&
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    };

    setEdges(nextEdges);
  }, [axis]);

  useEffect(() => {
    updateEdges();

    const element = scrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [children, updateEdges]);

  const setScrollElement = useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      updateEdges();
    },
    [updateEdges],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      scrollToBottom: (behavior = "smooth") => {
        const element = scrollRef.current;
        if (!element) return;

        element.scrollTo({
          behavior,
          top: element.scrollHeight,
        });
      },
    }),
    [],
  );

  return (
    <div className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}>
      <div
        ref={setScrollElement}
        onScroll={updateEdges}
        className={cn(
          "scrollbar-none min-h-0 min-w-0",
          axis === "horizontal" && "w-full overflow-x-auto overflow-y-hidden",
          axis === "vertical" && "h-full overflow-y-auto overflow-x-hidden",
          axis === "both" && "overflow-auto",
          scrollClassName,
        )}
      >
        <div
          className={cn(
            axis === "horizontal" && "w-fit min-w-full",
            axis === "vertical" && "h-fit min-h-full",
            axis === "both" && "h-fit min-h-full w-fit min-w-full",
          )}
        >
          {children}
        </div>
      </div>

      {edges.top ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 h-8 w-full",
            fadeClassName,
          )}
          style={{
            opacity: fadeIntensity,
            background:
              "linear-gradient(to bottom, hsl(var(--background)), transparent)",
          }}
        />
      ) : null}

      {edges.bottom ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full",
            fadeClassName,
          )}
          style={{
            opacity: fadeIntensity,
            background:
              "linear-gradient(to top, hsl(var(--background)), transparent)",
          }}
        />
      ) : null}

      {edges.left ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 h-full w-8",
            fadeClassName,
          )}
          style={{
            opacity: fadeIntensity,
            background:
              "linear-gradient(to right, hsl(var(--background)), transparent)",
          }}
        />
      ) : null}

      {edges.right ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-0 top-0 z-10 h-full w-8",
            fadeClassName,
          )}
          style={{
            opacity: fadeIntensity,
            background:
              "linear-gradient(to left, hsl(var(--background)), transparent)",
          }}
        />
      ) : null}
    </div>
  );
  },
);
