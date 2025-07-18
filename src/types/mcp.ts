/**
 * MCP tool input schemas and types
 */

import { z } from 'zod';

export const validateNodeSchema = z.object({
  nodeJson: z.string().describe('The JSON string of the n8n node to validate'),
  nodeType: z.string().describe('The type of node (e.g., "Github", "Slack", "HTTP Request")'),
  nodeVersion: z.string().optional().describe('Optional version of the node to validate against')
});

export const fetchNodeSpecSchema = z.object({
  nodeType: z.string().describe('The type of node to fetch specification for'),
  nodeVersion: z.string().optional().describe('Optional version of the node spec to fetch')
});

export const compareNodesSchema = z.object({
  localNode: z.string().describe('Local n8n node JSON string'),
  specNode: z.string().describe('Official specification node JSON string')
});

export type ValidateNodeInput = z.infer<typeof validateNodeSchema>;
export type FetchNodeSpecInput = z.infer<typeof fetchNodeSpecSchema>;
export type CompareNodesInput = z.infer<typeof compareNodesSchema>;

export interface NodeComparison {
  identical: boolean;
  differences: NodeDifference[];
  summary: string;
}

export interface NodeDifference {
  property: string;
  local: unknown;
  spec: unknown;
  type: 'missing_in_local' | 'extra_in_local' | 'different_value';
}