import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Sushi <span className="text-gold">Point</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Bestellingenbeheer</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
