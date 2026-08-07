export class ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | undefined
  
  constructor(
    statusCode: number,
    message: string,
    data?: T,
    success: boolean = true
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}