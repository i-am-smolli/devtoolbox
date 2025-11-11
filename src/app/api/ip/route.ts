import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Use x-forwarded-for header if available (common for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    return new NextResponse(ip, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Fallback to request.ip if x-forwarded-for is not present
  const ip = request.ip;
  if (ip) {
    return new NextResponse(ip, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // If no IP can be determined, return an error
  return new NextResponse("Could not determine IP address.", { status: 500 });
}
