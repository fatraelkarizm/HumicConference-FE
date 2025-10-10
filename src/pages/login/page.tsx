import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { loginUser } from '@/lib/LoginApi'; 
import type { LoginPayload } from '@/types/auth'; 

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk loading dan pesan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: LoginPayload = { email, password };
      const data = await loginUser(payload);
      console.log('Login success:', data);
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
     // @message: halaman login akan fetching data dari backend 
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex w-full max-w-5xl mx-4 bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Kolom Kiri (Ilustrasi) */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-12 bg-white text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Humic Conference
          </h1>
          <p className="text-[#64748B] mb-8 px-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit suspendisse.
          </p>
          <Image
            src="/Humic-Login.svg"
            alt="Person logging into a system"
            width={350} height={350} priority
            className="object-contain"
          />
        </div>

        {/* Kolom Kanan (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <p className="text-sm text-gray-500">Start for free</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Sign In to Humic Conference
          </h2>

          {/* Form */}

          <form onSubmit={handleSubmit}>

          {/* Email Field */}

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email" id="email" name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#64748B] placeholder:text-[#64748B placeholder:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password" id="password" name="password"
                  placeholder="6+ Characters, 1 Capital letter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#64748B] placeholder:text-[#64748B] placeholder:opacity-30"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading} 
              className="w-full bg-[#015B97] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#014d80] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#015B97] focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-8 space-y-1">
            <p>Humic Admin Dashboard</p>
            <p>© 2025 All Rights Reserved</p>
            <p className="pt-1">Made with ❤️ by summitdocs</p>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have any account?{" "}
            <Link href="/signup" className="text-[#015B97] hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}