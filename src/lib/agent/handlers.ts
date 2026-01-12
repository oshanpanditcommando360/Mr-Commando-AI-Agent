import { prisma } from "@/lib/prisma";

export async function handleFunctionCall(
  functionName: string,
  args: Record<string, unknown>
): Promise<string> {
  if (functionName === "execute_database_query") {
    try {
      const sqlQuery = args.sql_query as string;
      const explanation = args.explanation as string;

      console.log("Executing SQL:", sqlQuery);
      console.log("Explanation:", explanation);

      // Validate query - only allow SELECT
      const trimmedQuery = sqlQuery.trim().toLowerCase();
      if (!trimmedQuery.startsWith("select")) {
        return JSON.stringify({
          error: "Only SELECT queries are allowed",
          query: sqlQuery,
        });
      }

      // Block dangerous keywords
      const dangerousKeywords = [
        "drop",
        "delete",
        "truncate",
        "insert",
        "update",
        "alter",
        "create",
        "grant",
        "revoke",
        "execute",
        "exec",
      ];
      for (const keyword of dangerousKeywords) {
        if (trimmedQuery.includes(keyword)) {
          return JSON.stringify({
            error: `Forbidden keyword detected: ${keyword}`,
            query: sqlQuery,
          });
        }
      }

      // Execute the query using Prisma's raw query
      const result = await prisma.$queryRawUnsafe(sqlQuery);

      return JSON.stringify({
        data: result,
        count: Array.isArray(result) ? result.length : 0,
        explanation,
      });
    } catch (error) {
      console.error("SQL execution error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return JSON.stringify({
        error: errorMessage,
        query: args.sql_query,
      });
    }
  }

  return JSON.stringify({ error: `Unknown function: ${functionName}` });
}
