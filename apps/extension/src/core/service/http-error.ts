/**
 * Typed error for HTTP responses whose body isn't JSON (for example an old plain-text
 * "Not authenticated" 401 from web-next). Callers get a status and a short body snippet
 * in place of a SyntaxError from response.json().
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
    public code: string = 'non_json_response',
    public body: string = ''
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export type ResponseBody = { isJson: true; data: any } | { isJson: false; text: string };

type ResponseLike = {
  status: number;
  text?: () => Promise<string>;
  json: () => Promise<any>;
};

const BODY_SNIPPET_LENGTH = 200;

/**
 * Read a response body once. JSON is used only when the text actually parses (a JSON
 * content-type alone isn't trusted); anything else comes back as text so the caller can
 * raise an HttpError.
 */
export const readResponseBody = async (response: ResponseLike): Promise<ResponseBody> => {
  if (typeof response.text !== 'function') {
    // Minimal fetch stand-ins (tests) only implement json()
    return { isJson: true, data: await response.json() };
  }
  const text = await response.text();
  if (text.trim() === '') {
    return { isJson: false, text };
  }
  try {
    return { isJson: true, data: JSON.parse(text) };
  } catch {
    // Not JSON, even if the content-type claimed it
    return { isJson: false, text };
  }
};

export const nonJsonHttpError = (status: number, url: string, text: string): HttpError => {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    // keep the raw url
  }
  const snippet = text.slice(0, BODY_SNIPPET_LENGTH);
  return new HttpError(
    `HTTP ${status} from ${host}: ${snippet || '(empty body)'}`,
    status,
    url,
    status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'non_json_response',
    snippet
  );
};
