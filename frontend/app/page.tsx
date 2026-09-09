"use client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ReachInbox
          </h1>

          <p className="mt-2 text-gray-500">
            Smart Email Scheduling Platform
          </p>
        </div>

        <div className="mt-8">
          <a
            href={`${API_URL}/api/auth/google`}
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Continue with Google
          </a>
        </div>
      </div>
    </main>
  );
}