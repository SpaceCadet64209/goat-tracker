import { afterEach, describe, expect, it } from "vitest";

import { createTestContext, type TestContext } from "@/tests/helpers/supabase-fixtures";

describe("farm access policies", () => {
  let context: TestContext | undefined;

  afterEach(async () => {
    await context?.cleanup();
    context = undefined;
  });

  it("isolates owner, manager, worker, inactive, and unrelated identities", async () => {
    context = createTestContext();
    const owner = await context.createUser("Owner");
    const manager = await context.createUser("Manager");
    const worker = await context.createUser("Worker");
    const inactive = await context.createUser("Inactive");
    const unrelated = await context.createUser("Unrelated");
    const farm = await context.createFarm(owner);
    await context.addMembership(farm, manager, "manager");
    await context.addMembership(farm, worker, "worker");
    await context.addMembership(farm, inactive, "worker", "inactive");

    const [ownerClient, managerClient, workerClient, inactiveClient, unrelatedClient] =
      await Promise.all(
        [owner, manager, worker, inactive, unrelated].map((user) =>
          context!.createSession(user),
        ),
      );

    await expect(ownerClient!.from("farms").select("id").eq("id", farm.id)).resolves
      .toMatchObject({ data: [{ id: farm.id }], error: null });
    await expect(managerClient!.from("farms").select("id").eq("id", farm.id)).resolves
      .toMatchObject({ data: [{ id: farm.id }], error: null });
    await expect(workerClient!.from("farms").select("id").eq("id", farm.id)).resolves
      .toMatchObject({ data: [{ id: farm.id }], error: null });
    await expect(inactiveClient!.from("farms").select("id").eq("id", farm.id)).resolves
      .toMatchObject({ data: [], error: null });
    await expect(unrelatedClient!.from("farms").select("id").eq("id", farm.id)).resolves
      .toMatchObject({ data: [], error: null });

    const attemptedPromotion = await managerClient!
      .from("farm_memberships")
      .update({ role: "owner" })
      .eq("farm_id", farm.id)
      .eq("user_id", manager.id);
    expect(attemptedPromotion.error).toBeNull();
    const { data: membership } = await context.admin
      .from("farm_memberships")
      .select("role")
      .eq("farm_id", farm.id)
      .eq("user_id", manager.id)
      .single();
    expect(membership).toMatchObject({ role: "manager" });
  });

  it("keeps the only active owner when a direct membership update is attempted", async () => {
    context = createTestContext();
    const owner = await context.createUser("Owner");
    const farm = await context.createFarm(owner);
    const ownerClient = await context.createSession(owner);

    const result = await ownerClient
      .from("farm_memberships")
      .update({ status: "inactive" })
      .eq("farm_id", farm.id)
      .eq("user_id", owner.id);
    expect(result.error?.code).toBe("23514");
  });
});
