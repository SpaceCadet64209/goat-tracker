"use client";

import { useActionState } from "react";

import { uploadFarmFileAction } from "./actions";

export function FarmFileUploadForm({ farmId }: Readonly<{ farmId: string }>) {
  const [result, formAction, isPending] = useActionState(uploadFarmFileAction, null);
  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="farmId" value={farmId} />
      <label className="grid gap-1 text-sm font-medium" htmlFor="farm-file">
        Add a private farm file
        <span className="font-normal text-muted-foreground">JPEG, PNG, or PDF · maximum 10 MB</span>
      </label>
      <input id="farm-file" name="file" type="file" accept="image/jpeg,image/png,application/pdf" required />
      <input name="logicalArea" type="hidden" value="foundation" />
      {result && !result.ok ? <p className="text-sm text-destructive">{result.message}</p> : null}
      {result?.ok ? <p className="text-sm text-emerald-700">File uploaded securely.</p> : null}
      <button className="min-h-11 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60" disabled={isPending} type="submit">
        {isPending ? "Uploading…" : "Upload file"}
      </button>
    </form>
  );
}
