import { useCallback, useId, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dropzone({
  onFile,
  busy,
  compact,
}: {
  onFile: (file: File) => void;
  busy?: boolean;
  compact?: boolean;
}) {
  const [over, setOver] = useState(false);
  const id = useId();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      onFile(file);
    },
    [onFile],
  );

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition-[border-color,background-color] duration-fast ease-smooth",
        compact ? "min-h-40 py-8" : "min-h-56 py-10",
        over ? "border-accent bg-accent/10" : "border-border bg-elevated/40 hover:border-accent/50",
        busy && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
      <span className="mb-3 flex size-12 items-center justify-center rounded-md bg-card border border-border">
        <Upload className="size-5 text-accent" />
      </span>
      <p className="font-display text-lg font-semibold">Déposez votre graphique</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        PNG, JPG ou WebP. Incluez l’axe des prix et l’axe du temps.
      </p>
    </label>
  );
}
