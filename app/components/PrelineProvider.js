"use client";
import { useEffect } from "react";

export default function PrelineProvider() {
  useEffect(() => {
    import("preline/dist/preline");
  }, []);

  return null; // Ne renvoie rien, il sert juste à charger Preline côté client
}
