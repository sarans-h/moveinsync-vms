class Pagination {
  constructor(page = 1, limit = 10) {
    this.page = parseInt(page);
    this.limit = parseInt(limit);
    this.skip = (this.page - 1) * this.limit;
  }

  static createPaginationResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  static validatePaginationParams(page, limit) {
    if (page < 1) {
      throw new AppError('Page number must be greater than 0', 400);
    }
    if (limit < 1) {
      throw new AppError('Limit must be greater than 0', 400);
    }
    if (limit > 100) {
      throw new AppError('Limit cannot exceed 100', 400);
    }
    return true;
  }
}

module.exports = Pagination; 