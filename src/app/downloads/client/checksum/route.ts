import { handleStarterPackRequest } from "@/server/downloads/starter-pack";

export async function GET(request: Request) {
  return handleStarterPackRequest(request, "checksum");
}
