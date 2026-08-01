import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSafeTestEnvironment } from "./test-environment";

type FarmRole = "owner" | "manager" | "worker";
type MembershipStatus = "active" | "inactive";
export interface TestUser {
  id: string;
  email: string;
  password: string;
}
export interface TestFarm {
  id: string;
  name: string;
}
export interface TestContext {
  admin: SupabaseClient;
  users: TestUser[];
  farms: TestFarm[];
  createUser: (displayName?: string) => Promise<TestUser>;
  createFarm: (owner: TestUser, name?: string) => Promise<TestFarm>;
  addMembership: (
    farm: TestFarm,
    user: TestUser,
    role: FarmRole,
    status?: MembershipStatus,
  ) => Promise<void>;
  createSession: (user: TestUser) => Promise<SupabaseClient>;
  cleanup: () => Promise<void>;
}

function testLabel(): string {
  return `test-${crypto.randomUUID()}`;
}
export function createAdminClient(): SupabaseClient {
  const environment = getSafeTestEnvironment();
  return createClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Creates disposable, uniquely named data and supplies the matching cleanup. */
export function createTestContext(): TestContext {
  const admin = createAdminClient();
  const users: TestUser[] = [];
  const farms: TestFarm[] = [];
  async function createUser(displayName = "Test member"): Promise<TestUser> {
    const label = testLabel();
    const password = `Test-${crypto.randomUUID()}-aA1!`;
    const email = `${label}@goattrack.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error || !data.user)
      throw error ?? new Error("Test user was not created.");
    const user = { id: data.user.id, email, password };
    users.push(user);
    return user;
  }
  async function createSession(user: TestUser): Promise<SupabaseClient> {
    const environment = getSafeTestEnvironment();
    const client = createClient(
      environment.NEXT_PUBLIC_SUPABASE_URL,
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { error } = await client.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
    if (error) throw error;
    return client;
  }
  async function createFarm(
    owner: TestUser,
    name = `Farm ${testLabel()}`,
  ): Promise<TestFarm> {
    const ownerClient = await createSession(owner);
    const { data, error } = await ownerClient.rpc("create_farm", {
      p_name: name,
    });
    if (error || !data) throw error ?? new Error("Test farm was not created.");
    const farm = { id: data, name };
    farms.push(farm);
    return farm;
  }
  async function addMembership(
    farm: TestFarm,
    user: TestUser,
    role: FarmRole,
    status: MembershipStatus = "active",
  ): Promise<void> {
    const { error } = await admin
      .from("farm_memberships")
      .upsert(
        { farm_id: farm.id, user_id: user.id, role, status },
        { onConflict: "farm_id,user_id" },
      );
    if (error) throw error;
  }
  async function cleanup(): Promise<void> {
    if (farms.length) {
      const { error } = await admin
        .from("farms")
        .delete()
        .in(
          "id",
          farms.map(({ id }) => id),
        );
      if (error) throw error;
    }
    for (const user of users) {
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) throw error;
    }
  }
  return {
    admin,
    users,
    farms,
    createUser,
    createFarm,
    addMembership,
    createSession,
    cleanup,
  };
}
