import MyApplicationsDemo from "../../components/ui/my-applications-demo";

export const metadata = {
    title: "My Applications | Interera",
    description: "Track and manage your internship applications on the Interera platform.",
};

export default function ApplicationsPage() {
    return (
        <main>
            <MyApplicationsDemo />
        </main>
    );
}
