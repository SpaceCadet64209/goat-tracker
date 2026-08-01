"use client";

import { useActionState } from "react";

import { uploadFarmFileAction } from "./actions";

export function FarmFileUploadForm({ farmId }: Readonly<{ farmId: string }>) {
  const [result, formAction, isPending] = useActionState(
    uploadFarmFileAction,
    null,
  );
  return (
    <form
      action={formAction}
      className="border-border bg-card grid gap-3 rounded-xl border p-4"
    >
      <input type="hidden" name="farmId" value={farmId} />
      <label className="grid gap-1 text-sm font-medium" htmlFor="farm-file">
        Add a private farm file
        <span className="text-muted-foreground font-normal">
          JPEG, PNG, or PDF · maximum 10 MB
        </span>
      </label>
      <input
        id="farm-file"
        name="file"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        required
      />
      <input name="logicalArea" type="hidden" value="foundation" />
      {result && !result.ok ? (
        <p className="text-destructive text-sm">{result.message}</p>
      ) : null}
      {result?.ok ? (
        <p className="text-sm text-emerald-700">File uploaded securely.</p>
      ) : null}
      <button
        className="bg-primary text-primary-foreground min-h-11 rounded-md px-4 py-2 disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Uploading…" : "Upload file"}
      </button>
    </form>
  );
}
