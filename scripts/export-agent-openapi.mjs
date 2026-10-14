// Publish only the external-agent contract, not the backend's app/admin routes.
// Query constraints come from the live public schema. Response envelopes and
// stable error codes follow agent_api.py, agent_reads.py and agent_access.py.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const origin = 'https://api.buildmerger.com';
const response = await fetch(`${origin}/openapi.json`, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Schema request failed: ${response.status}`);
const source = await response.json();
const ref = name => ({ $ref: `#/components/schemas/${name}` });
const text = { type: 'string' };
const nullableText = { type: ['string', 'null'] };
const uuid = { type: 'string', format: 'uuid' };
const time = { type: 'string', format: 'date-time' };
const strings = { type: 'array', items: text };
const json = schema => ({ 'application/json': { schema } });
const object = properties => ({ type: 'object', properties, additionalProperties: true });
const schemas = {
  Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code'], properties: { code: text } } } },
  Coverage: object({ source: { type: 'string', const: 'saved_backend_records' }, resource: text, excluded: strings, deduplication: text, pagination: text, claimScope: text, relationships: text, missingValues: text }),
  Contact: object({ id: uuid, displayName: text, isMergerUser: { type: 'boolean' }, mergerHandle: nullableText, company: nullableText, side: nullableText, email: nullableText, phone: nullableText, note: nullableText, createdAt: time, identities: { type: 'array', items: object({ network: text, remoteIdentifier: text, visibility: text, homeserver: nullableText, roomId: nullableText }) } }),
  Deal: object({ id: uuid, name: text, terms: nullableText, vertical: text, status: text, nextStep: nullableText, startDate: { type: ['string', 'null'], format: 'date' }, dueDate: { type: ['string', 'null'], format: 'date' }, startedAt: time, openedAt: { type: 'string', format: 'date' }, updatedAt: time, archivedAt: { type: ['string', 'null'], format: 'date-time' }, partyContactIds: { type: 'array', items: uuid } }),
  Capabilities: object({ version: text, scopes: strings, readOnly: { type: 'boolean', const: true }, resources: strings, maxPageSize: { type: 'integer', const: 100 }, operations: strings, unavailable: strings, coverage: text }),
};
for (const kind of ['Contact', 'Deal']) {
  schemas[`${kind}Page`] = {
    ...object({ items: { type: 'array', items: ref(kind) }, nextCursor: nullableText, hasMore: { type: 'boolean' }, totalMatches: { type: 'integer' }, returnedCount: { type: 'integer' }, observedAt: time, coverage: ref('Coverage'), filters: object({ query: text, ...(kind === 'Deal' ? { archived: { type: 'boolean' } } : {}) }) }),
    required: ['items', 'nextCursor', 'hasMore', 'totalMatches', 'returnedCount', 'observedAt', 'coverage', 'filters'],
  };
  schemas[`${kind}Result`] = { ...object({ item: ref(kind), observedAt: time, coverage: ref('Coverage') }), required: ['item', 'observedAt', 'coverage'] };
}
const definitions = [
  ['capabilities', 'Capabilities', null, 'Read the operations and data coverage available to this grant.'],
  ['contacts', 'ContactPage', 'contacts.read', 'Search saved contacts with literal case-insensitive substring matching.'],
  ['contacts/{identity}', 'ContactResult', 'contacts.read', 'Read one saved contact by exact UUID.'],
  ['deals', 'DealPage', 'deals.read', 'Search saved deals; archived=false and archived=true are separate views.'],
  ['deals/{identity}', 'DealResult', 'deals.read', 'Read one saved deal by exact UUID.'],
];
const paths = {};
const securitySchemes = {};
for (const [suffix, model, scope, description] of definitions) {
  const path = `/api/agent/v1/${suffix}`;
  const operation = structuredClone(source.paths[path]?.get);
  if (!operation) throw new Error(`Missing live GET operation: ${path}`);
  for (const requirement of operation.security || []) for (const name of Object.keys(requirement)) {
    const scheme = source.components?.securitySchemes?.[name];
    if (scheme?.type !== 'http' || scheme.scheme !== 'bearer') throw new Error('Expected the REST bearer grant contract');
    securitySchemes[name] = { ...scheme, description: 'Merger read token issued in Merger Mod → Manage access. Hosted MCP OAuth tokens are not interchangeable with REST read tokens.' };
  }
  if (!Object.keys(securitySchemes).length) throw new Error('Missing REST authentication definition');
  operation.tags = ['Agent API v1'];
  operation.description = description;
  operation['x-merger-required-scope'] = scope;
  operation.responses = {
    '200': { description: 'Saved account-owned records or granted capabilities.', content: json(ref(model)) },
    '400': { description: 'invalid_request or invalid_cursor', content: json(ref('Error')) },
    '401': { description: 'invalid_agent_token: missing, expired, revoked, or invalid read token', content: json(ref('Error')) },
    '402': { description: 'product_access_required', content: json(ref('Error')) },
    ...(scope ? { '403': { description: 'insufficient_scope', content: json(ref('Error')) } } : {}),
    ...(suffix.includes('{identity}') ? { '404': { description: 'not_found in this account', content: json(ref('Error')) } } : {}),
    '429': { description: 'rate_limited: 120 reads per minute per grant', headers: { 'Retry-After': { description: 'Seconds to wait before retrying.', schema: { type: 'integer' } } }, content: json(ref('Error')) },
    '503': { description: 'agent_access_not_enabled', content: json(ref('Error')) },
  };
  paths[path] = { get: operation };
}
const published = {
  openapi: '3.1.0',
  info: { title: 'Merger Agent API', version: '1', description: 'Read-only, account-scoped saved contacts and deals. No messages, calendar, signatures, writes, or device-only records. REST read grants and hosted MCP OAuth credentials are separate.', contact: { name: 'Merger support', url: 'https://usemerger.com/support', email: 'support@usemerger.com' } },
  servers: [{ url: origin }],
  externalDocs: { url: 'https://usemerger.com/developers', description: 'API, hosted MCP, and CLI documentation' },
  paths,
  components: { schemas, securitySchemes },
  'x-merger-source-schema': `${origin}/openapi.json`,
};
const output = new URL('../public/developers/openapi.json', import.meta.url);
await mkdir(fileURLToPath(new URL('.', output)), { recursive: true });
await writeFile(output, JSON.stringify(published, null, 2) + '\n');
console.log(`Exported ${Object.keys(paths).length} read-only operations to public/developers/openapi.json`);
