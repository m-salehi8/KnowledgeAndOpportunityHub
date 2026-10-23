import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const HubApp = lazy(() => import("../hub/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "هاب دانش و فرصت‌ها — Knowledge & Opportunity Hub" },
      { name: "description", content: "Personal AI knowledge feed, daily digest and job radar with an iOS Liquid Glass design." },
      { property: "og:title", content: "هاب دانش و فرصت‌ها" },
      { property: "og:description", content: "AI knowledge feed, daily digest and scored job radar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="app-viewport" />;
  return (
    <Suspense fallback={<div className="app-viewport" />}>
      <HubApp />
    </Suspense>
  );
}
