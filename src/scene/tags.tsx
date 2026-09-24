import { Html } from "@react-three/drei";
import type { ReactNode } from "react";

export function Tag({
  position,
  children,
  active = false,
  onClick,
}: {
  position: [number, number, number];
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Html position={position} center distanceFactor={7} zIndexRange={[30, 0]} wrapperClass="tag-wrap">
      {onClick ? (
        <button type="button" className={active ? "tag on" : "tag"} onClick={onClick}>
          {children}
        </button>
      ) : (
        <span className="tag quiet">{children}</span>
      )}
    </Html>
  );
}
