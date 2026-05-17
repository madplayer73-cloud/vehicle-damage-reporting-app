declare const Netlify: {
  env: {
    get(key: string): string | undefined;
  };
};

export function isAccessCodeRequired(): boolean {
  return Boolean(Netlify.env.get("APP_USERS") || Netlify.env.get("APP_ACCESS_CODE"));
}

export function hasValidAccessCode(req: Request): boolean {
  return Boolean(getAuthorizedUser(req));
}

export function getAuthorizedUser(req: Request): { name: string; legacy: boolean } | undefined {
  const accessCode = req.headers.get("x-access-code") || "";
  const users = parseUsers(Netlify.env.get("APP_USERS"));

  if (users.length > 0) {
    const user = users.find((item) => item.code === accessCode);
    return user ? { name: user.name, legacy: false } : undefined;
  }

  const expectedCode = Netlify.env.get("APP_ACCESS_CODE");

  if (!expectedCode) {
    return { name: "", legacy: true };
  }

  return accessCode === expectedCode ? { name: "", legacy: true } : undefined;
}

function parseUsers(rawUsers: string | undefined): Array<{ name: string; code: string }> {
  if (!rawUsers) {
    return [];
  }

  return rawUsers
    .split(",")
    .map((entry) => {
      const [name, code] = entry.split(":").map((part) => part.trim());
      return { name, code };
    })
    .filter((entry) => entry.name && entry.code);
}
