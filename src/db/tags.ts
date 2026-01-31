/**
 * 模块E/H：Tags 数据操作（Turso 异步 API）
 */
import { getDb } from "./init";

interface TagRow {
  id: number;
  address: string;
  tag: string;
  created_at: string;
}

/**
 * 添加标签
 */
export async function addTag(address: string, tag: string): Promise<void> {
  const client = getDb();
  await client.execute({
    sql: `INSERT INTO address_tags (address, tag) VALUES (?, ?)`,
    args: [address.toLowerCase(), tag],
  });
}

/**
 * 查询标签（可选按地址筛选）
 */
export async function getTags(address?: string): Promise<TagRow[]> {
  const client = getDb();
  if (address) {
    const result = await client.execute({
      sql: "SELECT * FROM address_tags WHERE address = ?",
      args: [address.toLowerCase()],
    });
    return result.rows as unknown as TagRow[];
  }
  const result = await client.execute("SELECT * FROM address_tags");
  return result.rows as unknown as TagRow[];
}

/**
 * 批量查询多个地址的标签（Turso 异步 API）
 */
export async function getTagsForAddresses(addresses: string[]): Promise<Record<string, string[]>> {
  if (addresses.length === 0) return {};

  const db = getDb();
  const lowerAddrs = addresses.map((a) => a.toLowerCase());
  const placeholders = lowerAddrs.map(() => "?").join(",");

  const res = await db.execute({
    sql: `SELECT address, tag FROM address_tags WHERE address IN (${placeholders})`,
    args: lowerAddrs,
  });

  const result: Record<string, string[]> = {};
  for (const r of res.rows) {
    const row = r as unknown as { address: string; tag: string };
    if (!result[row.address]) result[row.address] = [];
    result[row.address].push(row.tag);
  }
  return result;
}
