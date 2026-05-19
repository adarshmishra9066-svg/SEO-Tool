'use client'

import OpportunityList from '@/components/opportunities/opportunity-list'
import type { Opportunity } from '@/lib/database.types'

export default function OpportunitiesClient({
  opportunities,
}: {
  opportunities: Opportunity[]
  clientId: string
}) {
  return <OpportunityList opportunities={opportunities} />
}
