import { ApiResponse } from "../types";

export const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> => ({
  success,
  message,
  data,
});
