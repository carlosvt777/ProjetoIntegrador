"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-accepted");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookie-accepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg border">
      <p className="text-sm mb-2">
        Usamos cookies para melhorar sua experiência.
      </p>
      <Button onClick={acceptCookies}>Aceitar</Button>
    </div>
  );
}
