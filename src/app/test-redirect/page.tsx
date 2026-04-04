import Link from "next/link";

export default function TestRedirectPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        Redirect Test Page
      </h1>
      <p className="text-lg text-blue-600">
        If you can see this page, navigation is working correctly!
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go back to Home
      </Link>
    </div>
  );
}
