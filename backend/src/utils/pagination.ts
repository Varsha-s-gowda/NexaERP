export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(
  page = 1,
  limit = 10
): PaginationOptions {
  const currentPage = Math.max(1, Number(page));
  const currentLimit = Math.max(1, Number(limit));

  return {
    page: currentPage,
    limit: currentLimit,
    skip: (currentPage - 1) * currentLimit,
  };
}