import { Suspense } from "react";
import PostReferralDemo from "../../../components/ui/post-referral-demo";

export default function PostReferralPage() {
    return (
        <main>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-medium">Loading referral details...</div>}>
                <PostReferralDemo />
            </Suspense>
        </main>
    );
}

