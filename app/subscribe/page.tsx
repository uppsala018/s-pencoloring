import { Suspense } from "react";
import SubscribeClient from "./SubscribeClient";

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin"/></div>}>
      <SubscribeClient />
    </Suspense>
  );
}
