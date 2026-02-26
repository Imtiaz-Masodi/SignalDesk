import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getIssueByNumber } from "@/server/actions/issues";
import { Button } from "@/components/ui/button";
import { IssueDetail } from "./issue-detail";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string; issueNumber: string }>;
}) {
  const { slug, issueNumber } = await params;
  const num = parseInt(issueNumber, 10);
  if (isNaN(num)) notFound();

  const issue = await getIssueByNumber(slug, num);
  if (!issue) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${slug}/issues`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
          </Link>
        </Button>
      </div>

      <IssueDetail issue={issue} slug={slug} />
    </div>
  );
}
