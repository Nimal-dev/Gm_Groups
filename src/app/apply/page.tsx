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
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 bg-[url('/gm_wallpaper.jpg')] bg-cover bg-center bg-no-repeat fixed"
                style={{ transform: "translateZ(0)" }}
            />
            {/* Cinematic Gradient Overlays to ensure text remains readable */}
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent z-0" />

            {/* Navigation */}
            <div className="relative z-10">
                <Header />
            </div>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-24 relative z-10">
                <div className="container px-4 mx-auto max-w-3xl">
                    <ApplicationForm />
                </div>
            </main>

            <div className="relative z-10 mt-auto">
                <Footer />
            </div>
        </div>
    );
}
