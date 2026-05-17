declare const Netlify: {
  env: {
    get(key: string): string | undefined;
  };
};

export function isAccessCodeRequired(): boolean {
  return Boolean(Netlify.env.get("APP_ACCESS_CODE"));
}

export function hasValidAccessCode(req: Request): boolean {
  const expectedCode = Netlify.env.get("APP_ACCESS_CODE");

  if (!expectedCode) {
    return true;
  }

  return req.headers.get("x-access-code") === expectedCode;
}
