"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    vapiSDK?: {
      run: (config: {
        apiKey: string;
        assistant: string;
        config?: Record<string, unknown>;
      }) => unknown;
    };
  }
}

const VAPI_ASSISTANT_ID = "1f3782c7-f440-48bd-ac7d-387d1654f6f0";

export default function VapiWidget() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!apiKey) {
      console.warn(
        "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set — Vapi widget disabled."
      );
      return;
    }

    if (window.vapiSDK) {
      window.vapiSDK.run({ apiKey, assistant: VAPI_ASSISTANT_ID, config: {} });
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;
    script.onload = () => {
      window.vapiSDK?.run({
        apiKey,
        assistant: VAPI_ASSISTANT_ID,
        config: {},
      });
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
