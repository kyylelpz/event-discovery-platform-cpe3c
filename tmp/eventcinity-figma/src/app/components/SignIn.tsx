import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from './Button';
import { Footer } from './Footer';

export function SignIn({ onBack }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-20 left-4 z-10 p-2 sm:p-3 bg-[#FCFCFC] border border-[#C0C0C1] rounded-full hover:bg-[#C0C0C1]/20 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#020202]" />
        </button>
      )}

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#020202]">Welcome Back</h1>
            <p className="text-sm sm:text-base lg:text-lg text-[#696258]">Sign in to your Eventcinity account</p>
          </div>

          <form className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm sm:text-base text-[#020202]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#696258]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm sm:text-base text-[#020202]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#696258]" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-[#C0C0C1] rounded text-[#2D3B15] focus:ring-[#2D3B15]"
                />
                <span className="text-xs sm:text-sm text-[#696258]">Remember me</span>
              </label>
              <a href="#" className="text-xs sm:text-sm text-[#2D3B15] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button variant="primary" className="w-full">Sign In</Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C0C0C1]"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-[#FCFCFC] text-[#696258]">or</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full">Create New Account</Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-[#696258]">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#2D3B15] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#2D3B15] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
