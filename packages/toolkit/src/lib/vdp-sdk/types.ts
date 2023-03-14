/* eslint-disable @typescript-eslint/no-explicit-any */

export type ErrorDetails = {
  "@type": string;
  violations?: Violation[];
  description?: string;
};

export type Violation = {
  type: string;
  description: string;
  subject: string;
};

export type Operation = {
  name: string;
  response: any;
  metadata: any;
  done: boolean;
};