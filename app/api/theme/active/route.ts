import { NextResponse } from "next/server"
import { getActiveTheme } from "@/lib/theme-actions"

export async function GET() {
  try {
    const activeTheme = await getActiveTheme()

    if (!activeTheme) {
      return NextResponse.json(null, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    return NextResponse.json(activeTheme, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching active theme:", error)
    return NextResponse.json(
      { error: "Failed to fetch active theme" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
