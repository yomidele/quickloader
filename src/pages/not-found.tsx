export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
        <a href="/" className="mt-8 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Go home
        </a>
      </div>
    </div>
  )
}
