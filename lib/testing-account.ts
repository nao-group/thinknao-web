const testingEmail = process.env.NEXT_PUBLIC_TESTING_EMAIL?.trim().toLowerCase();

export function isTestingAccount(email: string | null | undefined): boolean {
  return Boolean(testingEmail && email?.trim().toLowerCase() === testingEmail);
}
