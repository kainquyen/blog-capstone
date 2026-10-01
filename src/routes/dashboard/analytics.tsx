import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { ChartAreaInteractive } from '~/components/chart-area-interactive'

export const Route = createFileRoute('/dashboard/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  const dataVistor = useLoaderData({from: "/dashboard"})
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={dataVistor}/>
        </div>
      </div>
    </div>
  )
}
