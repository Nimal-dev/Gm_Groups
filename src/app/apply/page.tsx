import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ApplicationForm } from '@/components/sections/application-form';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default async function ApplyPage() {
    const session = await auth();

    // If not logged in at all, redirect to login
    if (!session) {
        redirect('/login');
    }

    // Optional: If an active employee somehow navigates here, you can redirect them to dashboard
    if (session.user.role !== 'applicant') {
        redirect('/dashboard');
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow flex items-center justify-center py-20">
                <div className="container px-4 mx-auto max-w-3xl">
                    <ApplicationForm />
                </div>
            </main>
            <Footer />
        </div>
    );
}
