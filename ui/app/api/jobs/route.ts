import { type NextRequest } from "next/server";
import { FilterJobsDTO } from "@/lib/types";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.API_ENDPOINT;

  try {
    const searchParams = request.nextUrl.searchParams;

    // Get all tags from the query parameters
    const tags = searchParams.getAll("tags[]");

    const validatedParams = FilterJobsDTO.parse({
      status: searchParams.get("status") || undefined,
      tags: tags,
      sort_direction: searchParams.get("sort_direction") || "desc",
      sort_by: searchParams.get("sort_by") || "created_at",
      page: searchParams.get("page") || 0,
      page_size: searchParams.get("page_size") || 10,
    });

    // Build query parameters for the backend API
    const apiParams = new URLSearchParams();
    if (validatedParams.status)
      apiParams.append("status", validatedParams.status);
    if (
      Array.isArray(validatedParams?.tags) &&
      validatedParams?.tags?.length > 0
    ) {
      validatedParams?.tags?.forEach((tag) => apiParams.append("tags[]", tag));
    }
    apiParams.append("sort_direction", validatedParams.sort_direction);
    apiParams.append("sort_by", validatedParams.sort_by);
    apiParams.append("page", validatedParams.page.toString());
    apiParams.append("page_size", validatedParams.page_size.toString());

    const response = await fetch(
      `${API_BASE_URL}/jobs?${apiParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return Response.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
