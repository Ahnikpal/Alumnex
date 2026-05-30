import { Suspense } from "react";
import ApplicationsDemo from "../../../components/ui/applications-demo";

export default function ApplicationsPage() {
    return (
        <main>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-medium">Loading applications...</div>}>
                <ApplicationsDemo />
            </Suspense>
        </main>
    );
}

