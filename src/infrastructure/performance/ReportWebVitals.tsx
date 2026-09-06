"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
};

export function ReportWebVitals() {
  useReportWebVitals((metric: WebVitalMetric) => {
    const payload = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: window.location.pathname,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`,
      );
      return;
    }

    // Producción: envío no bloqueante. sendBeacon sobrevive al unload.
    const endpoint = "/api/analytics/vitals";
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, payload);
      } else {
        fetch(endpoint, {
          method: "POST",
          body: payload,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
    } catch {
      // Nunca romper la app por analíticas
    }
  });

  return null;
}
