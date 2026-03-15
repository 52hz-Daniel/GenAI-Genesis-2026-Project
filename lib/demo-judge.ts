import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Returns the effective user email for this request: either the signed-in user
 * or the demo judge user when the demo_judge cookie is set (for hackathon judges).
 * Set DEMO_JUDGE_EMAIL in env and use POST /api/demo/judge to set the cookie.
 * Cookie is checked first so demo judge works even when getServerSession has no request context in Route Handlers.
 */
export async function getEffectiveUser(request: NextRequest): Promise<{ email: string } | null> {
  const cookie = request.cookies.get("demo_judge");
  const hasCookie = !!(cookie?.value);
  const cookieLen = cookie?.value?.length ?? 0;
  const hasDemoEmail = !!process.env.DEMO_JUDGE_EMAIL;
  // #region agent log
  fetch('http://127.0.0.1:7683/ingest/9250a4a4-eabe-480a-9c5d-97ebeeafe803',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6526e8'},body:JSON.stringify({sessionId:'6526e8',location:'lib/demo-judge.ts:getEffectiveUser',message:'getEffectiveUser entry',data:{hasCookie,cookieLen,hasDemoEmail,allCookieNames:request.cookies.getAll?.()?.map(c=>c.name)??[]},timestamp:Date.now(),hypothesisId:'H1-H3'})}).catch(()=>{});
  // #endregion
  if (cookie?.value && process.env.DEMO_JUDGE_EMAIL)
    return { email: process.env.DEMO_JUDGE_EMAIL };
  const session = await getServerSession(authOptions);
  const hasSession = !!(session?.user?.email);
  // #region agent log
  fetch('http://127.0.0.1:7683/ingest/9250a4a4-eabe-480a-9c5d-97ebeeafe803',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6526e8'},body:JSON.stringify({sessionId:'6526e8',location:'lib/demo-judge.ts:getEffectiveUser',message:'getEffectiveUser exit',data:{hasSession,result:hasCookie&&hasDemoEmail?'demo':hasSession?'session':'null'},timestamp:Date.now(),hypothesisId:'H1-H5'})}).catch(()=>{});
  // #endregion
  if (session?.user?.email) return { email: session.user.email };
  return null;
}
