export type Job = {
  id: string;
  attributes: {
    title: string;
    description: string;
    functions: string;
    benefits?: string;
    desirable?: string;
    min_salary?: number;
    max_salary?: number;
    remote_modality: string;
    seniority: {
      data: {
        id: number;
      };
    };
    modality: {
      data: {
        id: number;
      };
    };
    published_at: number;
    company: {
      data: {
        id: string;
      };
    };
  };
};

export type Response = {
  data: Job[];
  meta: {
    page: number;
    total_pages: number;
  };
};
