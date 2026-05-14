import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] text-white p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-red-400">Authentication Error</h1>
        <p className="text-muted-foreground">
          Something went wrong while trying to sign you in. This can happen if the link has expired or has already been used.
        </p>
        <div className="pt-4">
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
