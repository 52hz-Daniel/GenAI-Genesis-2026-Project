import NextLink from "next/link";

export function Link({
  href,
  children,
  className = "",
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) {
  return (
    <NextLink
      href={href}
      className={`text-accent hover:underline underline-offset-2 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
