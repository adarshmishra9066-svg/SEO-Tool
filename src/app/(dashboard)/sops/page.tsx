import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { SopLibrary } from '@/components/sops/sop-library'
import { BUILT_IN_SOPS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'SOPs',
}

export default function SopsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Standard Operating Procedures"
        description={`${BUILT_IN_SOPS.length} built-in SOPs covering all core SEO operations`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'SOPs' },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <SopLibrary />
      </div>
    </div>
  )
}
