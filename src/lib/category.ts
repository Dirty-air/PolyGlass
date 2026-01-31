/**
 * 分类名称标准化工具（客户端/服务端通用）
 */

/** 分类名称标准化映射 */
const CATEGORY_MAPPING: Record<string, string> = {
  "US-current-affairs": "Politics",
  "Global Politics": "Politics",
  "NBA Playoffs": "Sports",
  "Pop-Culture": "Culture",
  "Pop-Culture ": "Culture",  // 有空格的版本
};

/**
 * 首字母大写
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 标准化分类名称
 * 如: "US-current-affairs" -> "Politics"
 */
export function normalizeCategory(raw: string): string {
  const trimmed = raw.trim();
  return CATEGORY_MAPPING[trimmed] || capitalize(trimmed);
}
