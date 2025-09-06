export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ConstructPro
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Construction Project Management Platform
        </p>
        <div className="space-y-4">
          <a 
            href="/auth/signin" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
          <br />
          <a 
            href="/auth/signup" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}