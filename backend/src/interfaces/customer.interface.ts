export interface CreateCustomerRequest {
  customerCode: string;
  customerName: string;
  businessName: string;
  mobile: string;
  email?: string;
  gstNumber?: string;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  customerCode?: string;
  customerName?: string;
  businessName?: string;
  mobile?: string;
  email?: string;
  gstNumber?: string;
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  address?: string;
  followUpDate?: string;
  notes?: string;
}

export interface CustomerResponse {
  id: string;
  customerCode: string;
  customerName: string;
  businessName: string;
  mobile: string;
  email: string | null;
  gstNumber: string | null;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  address: string;
  followUpDate: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}