/**
 * Sample node data for testing
 */

export const validGitHubNode = {
  displayName: 'GitHub',
  name: 'github',
  version: 1,
  description: 'GitHub API operations',
  group: ['Development'],
  icon: 'file:github.svg',
  properties: [
    {
      displayName: 'Repository',
      name: 'repository',
      type: 'string',
      required: true,
      description: 'The GitHub repository'
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      required: true,
      description: 'The operation to perform'
    }
  ],
  inputs: [],
  outputs: []
};

export const invalidGitHubNode = {
  // Missing displayName
  name: 'github',
  version: '1', // Wrong type (should be number)
  description: 'GitHub API operations',
  group: 'Development', // Wrong type (should be array)
  properties: [
    {
      // Missing displayName
      name: 'repository',
      type: 'string'
    }
  ]
};

export const sampleTypeScriptContent = `
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class GitHub implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'GitHub',
    name: 'github',
    version: 1,
    description: 'GitHub API operations',
    group: ['Development'],
    icon: 'file:github.svg',
    properties: [
      {
        displayName: 'Repository',
        name: 'repository',
        type: 'string',
        required: true,
        description: 'The GitHub repository'
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        required: true,
        description: 'The operation to perform'
      }
    ],
    inputs: ['main'],
    outputs: ['main']
  };
}
`;

export const sampleJsonContent = `{
  "displayName": "GitHub",
  "name": "github",
  "version": 1,
  "description": "GitHub API operations",
  "icon": "file:github.svg"
}`;

export const sampleNodeSpecification = {
  nodeType: 'GitHub',
  tsContent: sampleTypeScriptContent,
  jsonContent: sampleJsonContent,
  path: 'packages/nodes-base/nodes/GitHub/GitHub.node.ts',
  version: 'latest'
};

export const sampleParsedDefinition = {
  displayName: 'GitHub',
  name: 'github',
  version: 1,
  description: 'GitHub API operations',
  properties: [
    {
      displayName: 'Repository',
      name: 'repository',
      type: 'string',
      required: true,
      description: 'The GitHub repository'
    },
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      required: true,
      description: 'The operation to perform'
    }
  ],
  inputs: [],
  outputs: [],
  group: ['Development'],
  icon: 'file:github.svg'
};