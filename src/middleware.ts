import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/sign-in" },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/log/:path*", "/profile/:path*"],
};

