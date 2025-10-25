'use client';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome to your admin panel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Quick Stats
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your statistics will appear here
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recent Activity
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Recent activities will appear here
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Notifications
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your notifications will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
