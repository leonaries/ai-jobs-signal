import { readFile } from "node:fs/promises";
import postgres from "postgres";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: tsx scripts/run-sql-file.ts <path-to-sql>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 1,
    prepare: false
  });

  try {
    const statement = await readFile(filePath!, "utf8");
    await sql.unsafe(statement);
    await sql.end();
    console.log(`Executed ${filePath}`);
  } catch (error) {
    await sql.end();
    console.error(error);
    process.exit(1);
  }
}

void main();
