import React from "react";
import Link from "next/link";
import { getTesterAssignments } from "@/server/services/tester-portal-service";
import { requireActiveTester } from "@/lib/permissions";
import { PageHeader } from "@/components/brand/headers";
import { TechnicalDivider } from "@/components/brand/metadata";
import { StatusBadge } from "@/components/brand/status";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const revalidate = 0;

export default async function TesterDashboardPage() {
  const { session } = await requireActiveTester();
  const assignments = await getTesterAssignments(session.user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-kavri-muted">
          Tester Workspace
        </span>
        <PageHeader
          title="Assignments Briefs"
          description="Access active testing guidelines and confirm sample batch acceptances."
        />
      </div>
      <TechnicalDivider />

      {assignments.length === 0 ? (
        <Card className="border-kavri-line bg-kavri-surface dark:bg-card text-center p-8">
          <CardContent className="font-mono text-xs text-kavri-muted">
            No testing assignments dispatched to your account.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((asg) => (
            <Card
              key={asg.id}
              className={`border-kavri-line bg-kavri-surface dark:bg-card hover:border-kavri-line-strong transition-colors ${
                asg.progress.label === "active" || asg.progress.label === "first_impression_due" ? "ring-1 ring-kavri-signal/30" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-kavri-muted bg-kavri-surface-subtle px-1.5 py-0.5 border border-kavri-line rounded-sm">
                      Sample Code: {asg.sample.sampleCode}
                    </span>
                    <CardTitle className="font-heading text-sm font-bold mt-1">
                      {asg.product.publicAlias}
                    </CardTitle>
                  </div>
                  <StatusBadge status={asg.progress.label} />
                </div>
              </CardHeader>
              <CardContent className="font-mono text-xs space-y-3">
                <div className="flex justify-between items-center text-[10px] text-kavri-muted border-b border-kavri-line/40 pb-2">
                  <span>Revision: {asg.revision.revisionCode}</span>
                  <span className="flex items-center gap-1.5">
                    Due: {new Date(asg.dueAt).toLocaleDateString()}
                    {asg.progress.overdue && (
                      <span className="text-[9px] font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm">
                        Overdue
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-kavri-ink dark:text-foreground line-clamp-2 leading-relaxed">
                  {asg.instructions}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/tester/assignments/${asg.id}`}
                    className="block w-full text-center bg-kavri-ink text-kavri-paper dark:bg-foreground dark:text-background py-2 text-xs font-mono uppercase tracking-wider rounded-sm hover:opacity-95 transition-opacity min-h-[44px] flex items-center justify-center"
                  >
                    View Brief &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
