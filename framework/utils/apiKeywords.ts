import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

export type ApiMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

type FetchOptions = NonNullable<Parameters<APIRequestContext['fetch']>[1]>;

type HeaderExpectation = string | RegExp;

type XmlAttributes = Record<string, string>;

type XmlChild = XmlNode | string;

interface XmlNode {
  name: string;
  attributes: XmlAttributes;
  children: XmlChild[];
}

export class ApiKeywords {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL?: string
  ) {}

  async sendApiRequest(
    method: ApiMethod,
    endpoint: string,
    options?: FetchOptions
  ): Promise<APIResponse> {
    const target = this.resolveUrl(endpoint);
    const requestOptions: FetchOptions = {
      ...(options ?? {}),
      method,
    } as FetchOptions;

    return this.request.fetch(target, requestOptions);
  }

  async getResponseBody<T = unknown>(response: APIResponse): Promise<T> {
    const buffer = await response.body();

    if (!buffer.length) {
      return undefined as unknown as T;
    }

    if (this.isJsonResponse(response)) {
      return JSON.parse(buffer.toString('utf-8')) as T;
    }

    return buffer.toString('utf-8') as unknown as T;
  }

  async getResponseBodyXmlToJson(response: APIResponse): Promise<unknown> {
    const xmlText = await response.text();
    return this.parseXml(xmlText);
  }

  getResponseHeader(response: APIResponse, headerName: string): string | undefined {
    const headers = response.headers();
    const normalised = headerName.toLowerCase();
    return headers[normalised];
  }

  getResponseStatusCode(response: APIResponse): number {
    return response.status();
  }

  async verifyResponseHeaderValue(
    response: APIResponse,
    headerName: string,
    expected: HeaderExpectation
  ): Promise<void> {
    const actual = this.getResponseHeader(response, headerName);
    expect(actual, `Expected "${headerName}" header to be present`).toBeTruthy();

    if (actual === undefined) {
      return;
    }

    if (expected instanceof RegExp) {
      expect(actual).toMatch(expected);
    } else {
      expect(actual).toBe(expected);
    }
  }

  async verifyResponseStatusCode(response: APIResponse, expected: number): Promise<void> {
    expect(response.status()).toBe(expected);
  }

  private resolveUrl(endpoint: string): string {
    if (!this.baseURL || /^https?:/i.test(endpoint)) {
      return endpoint;
    }

    const trimmedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL.replace(/\/?$/, '/')}${trimmedEndpoint}`;
  }

  private isJsonResponse(response: APIResponse): boolean {
    const contentType = this.getResponseHeader(response, 'content-type');
    return Boolean(contentType && contentType.includes('application/json'));
  }

  private parseXml(xml: string): unknown {
    const cleaned = xml.trim();
    if (!cleaned) {
      return {};
    }

    const parser = new SimpleXmlParser(cleaned);
    const node = parser.parse();
    const root = convertNodeToJson(node);
    return { [node.name]: root };
  }
}

class SimpleXmlParser {
  private index = 0;

  constructor(private readonly input: string) {}

  parse(): XmlNode {
    this.skipProlog();
    this.consumeWhitespace();
    const node = this.parseElement();
    this.consumeWhitespace();
    return node;
  }

  private parseElement(): XmlNode {
    this.expect('<');
    if (this.peek() === '/') {
      throw new Error('Unexpected closing tag');
    }

    const name = this.readName();
    const attributes: XmlAttributes = {};

    while (true) {
      this.consumeWhitespace();
      const current = this.peek();

      if (current === '/' || current === '>') {
        break;
      }

      const attrName = this.readName();
      this.consumeWhitespace();
      this.expect('=');
      this.consumeWhitespace();
      const value = this.readAttributeValue();
      attributes[attrName] = value;
    }

    this.consumeWhitespace();

    if (this.peek() === '/') {
      this.index += 2; // self closing '/>'
      return { name, attributes, children: [] };
    }

    this.expect('>');

    const children: XmlChild[] = [];

    while (true) {
      this.consumeWhitespace();

      if (this.peek() === '<') {
        if (this.peek(1) === '/') {
          this.index += 2;
          const closingName = this.readName();
          if (closingName !== name) {
            throw new Error(`Mismatched closing tag: expected ${name} but found ${closingName}`);
          }
          this.consumeWhitespace();
          this.expect('>');
          break;
        }

        if (this.peek(1) === '!' && this.peek(2) === '-' && this.peek(3) === '-') {
          this.readComment();
          continue;
        }

        if (this.peek(1) === '!' && this.input.slice(this.index, this.index + 9) === '<![CDATA[') {
          children.push(this.readCData());
          continue;
        }

        children.push(this.parseElement());
      } else {
        const text = this.readText();
        if (text.trim().length > 0) {
          children.push(text);
        }
      }
    }

    return { name, attributes, children };
  }

  private readName(): string {
    const start = this.index;
    const first = this.peek();

    if (!first || !/[A-Za-z_]/.test(first)) {
      throw new Error(`Invalid XML name at position ${this.index}`);
    }

    this.index++;

    while (this.index < this.input.length) {
      const char = this.peek();
      if (!char || !/[\w\-.:]/.test(char)) {
        break;
      }
      this.index++;
    }

    return this.input.slice(start, this.index);
  }

  private readAttributeValue(): string {
    const quote = this.peek();
    if (quote !== '"' && quote !== '\'') {
      throw new Error('Expected quote for attribute value');
    }

    this.index++;
    let value = '';
    while (this.index < this.input.length && this.peek() !== quote) {
      value += this.input[this.index++];
    }

    this.expect(quote);
    return decodeEntities(value);
  }

  private readText(): string {
    const start = this.index;
    while (this.index < this.input.length && this.peek() !== '<') {
      this.index++;
    }
    return decodeEntities(this.input.slice(start, this.index));
  }

  private readComment(): void {
    const end = this.input.indexOf('-->', this.index + 4);
    if (end === -1) {
      throw new Error('Unterminated XML comment');
    }
    this.index = end + 3;
  }

  private readCData(): string {
    const end = this.input.indexOf(']]>', this.index + 9);
    if (end === -1) {
      throw new Error('Unterminated CDATA section');
    }
    const content = this.input.slice(this.index + 9, end);
    this.index = end + 3;
    return content;
  }

  private skipProlog(): void {
    if (this.input.startsWith('<?')) {
      const end = this.input.indexOf('?>', this.index);
      if (end === -1) {
        throw new Error('Unterminated XML prolog');
      }
      this.index = end + 2;
    }
  }

  private consumeWhitespace(): void {
    while (this.index < this.input.length && /\s/.test(this.input[this.index]!)) {
      this.index++;
    }
  }

  private expect(char: string): void {
    if (this.input[this.index] !== char) {
      throw new Error(`Expected '${char}' at position ${this.index}`);
    }
    this.index++;
  }

  private peek(offset = 0): string {
    return this.input[this.index + offset] ?? '';
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

function convertNodeToJson(node: XmlNode): unknown {
  const result: Record<string, unknown> = {};
  const attributeKeys = Object.keys(node.attributes);

  if (attributeKeys.length > 0) {
    result['@attributes'] = { ...node.attributes };
  }

  const textSegments: string[] = [];
  const groupedChildren = new Map<string, unknown[]>();

  for (const child of node.children) {
    if (typeof child === 'string') {
      const trimmed = child.trim();
      if (trimmed.length > 0) {
        textSegments.push(trimmed);
      }
    } else {
      const json = convertNodeToJson(child);
      const collection = groupedChildren.get(child.name) ?? [];
      collection.push(json);
      groupedChildren.set(child.name, collection);
    }
  }

  for (const entry of Array.from(groupedChildren.entries())) {
    const [name, values] = entry;
    result[name] = values.length === 1 ? values[0] : values;
  }

  if (textSegments.length > 0) {
    const textValue = textSegments.join(' ');
    if (attributeKeys.length === 0 && groupedChildren.size === 0) {
      return textValue;
    }
    result['#text'] = textValue;
  }

  return result;
}
