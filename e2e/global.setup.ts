import { getSafeTestEnvironment } from "../tests/helpers/test-environment";
export default function globalSetup(): void {
  getSafeTestEnvironment();
}
