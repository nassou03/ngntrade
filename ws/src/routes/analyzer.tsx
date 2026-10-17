import { createFileRoute } from "@tanstack/react-router";
import { AnalyzerWorkspace } from "@/components/analyzer/workspace";

export const Route = createFileRoute("/analyzer")({
  component: AnalyzerPage,
});

function AnalyzerPage() {
  return <AnalyzerWorkspace />;
}
