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

  // Fallback: try to get IP from request headers or connection
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("fastly-client-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-cluster-client-ip") ||
    request.headers.get("x-forwarded") ||
    request.headers.get("forwarded-for") ||
    request.headers.get("forwarded") ||
    null;

  if (ip) {
    return new NextResponse(ip, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // If no IP can be determined, return an error
  return new NextResponse("Could not determine IP address.", { status: 500 });
}
