export type Equipment = {
  equipmentsId: number;
  number: string;
  name: string;
};

export type issueReport = {
  id: number;
  equipmentId: number;
  reportedBy: string;
  priorityIssue: string;
  typeIssue: string;
  descriptionIssue: string;
  createdAt: string;
};

export type Issue = {
  equipmentsIssuesId: number;
  equipmentNumber: string;
  equipmentName: string;
  flow: string;
  reportedBy: string;
  reportedDate: string;
  priorityIssue: string;
  typeIssue: string;
  descriptionIssue: string;
  details: string;
  createdBy: string;
  updatedBy: string;
  comments: string;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
};

export type Role = {
  id: number;
  name: string;
};

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Página actual (0-indexed)
  last: boolean;
  first: boolean;
}

export interface UseGetReportsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  searchTerm?: string;
  priorityFilter?: string;
  typeFilter?: string;
}

export interface UseGetIssuesParams {
  flow?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  searchTerm?: string;
  priorityFilter?: string;
  typeFilter?: string;
}

export type Employee = {
  employeesId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  title: string;
};

export type IssueCreate = {
  issueReportId?: number;
  equipmentsIssuesId: number;
  checklistsId: number;
  equipmentsId: number;
  flow: string;
  reportedBy: string;
  reportedDate: string;
  priorityIssue: string;
  typeIssue: string;
  descriptionIssue: string;
  details: string;
  createdBy: string;
  updatedBy: string;
};

export type EquipmentIssueRequestDto = {
  equipmentId: number;
  reportedBy: string;
  issueDescription: string;
  severity: string;
  userName: string;
  referenceID: number;
  issueType: string;
  details: string;
};

export type CreateIssuePayload = {
  equipmentNumber: string;
  priorityIssue: string;
  typeIssue: string;
  descriptionIssue: string;
  details?: string;
  reportedBy?: string;
};