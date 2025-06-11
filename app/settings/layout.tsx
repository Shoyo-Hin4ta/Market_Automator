export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Connect Your Services</h1>
      {children}
    </div>
  )
}