import type { ComponentProps } from "react";

type CardProps = ComponentProps<"div">;

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`border-card-border shadow-card w-full rounded-xl border border-solid bg-white ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
