"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "bg-neutral-900 text-white border border-neutral-700",
      }}
    />
  );
}
